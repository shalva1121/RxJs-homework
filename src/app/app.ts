import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Product, ViewState } from './models';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  imports: [NgFor, NgIf, AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  // 'any' = don't filter by this field
  form = this.fb.nonNullable.group({
    vegeterian: 'any',
    nuts: 'any',
    spiciness: 'any',
  });

  state$: Observable<ViewState> = this.form.valueChanges.pipe(
    startWith(null),
    map(() => this.form.getRawValue()),
    debounceTime(250),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    switchMap((filters) =>
      this.productService.getProducts(filters).pipe(
        map((products): ViewState => ({ loading: false, error: '', products })),
        catchError(() =>
          of<ViewState>({ loading: false, error: 'Could not load products.', products: [] })
        ),
        startWith<ViewState>({ loading: true, error: '', products: [] })
      )
    )
  );

  trackById(_: number, p: Product) {
    return p.id;
  }

  reset() {
    this.form.reset();
  }
}
