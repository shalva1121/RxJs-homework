import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
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

interface Product {
  id: number;
  name: string;
  price: number;
  nuts: boolean;
  vegeterian: boolean;
  spiciness: number;
  image?: string;
  category?: { name?: string };
}

interface ViewState {
  loading: boolean;
  error: string;
  products: Product[];
}

const API = 'https://restaurant.stepprojects.ge/api/Products';

@Component({
  selector: 'app-root',
  imports: [NgFor, NgIf, AsyncPipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);
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
      this.load(filters).pipe(
        map((products): ViewState => ({ loading: false, error: '', products })),
        catchError(() =>
          of<ViewState>({ loading: false, error: 'Could not load products.', products: [] })
        ),
        startWith<ViewState>({ loading: true, error: '', products: [] })
      )
    )
  );

  private load(f: { vegeterian: string; nuts: string; spiciness: string }): Observable<Product[]> {
    const isAny = f.vegeterian === 'any' && f.nuts === 'any' && f.spiciness === 'any';
    if (isAny) {
      return this.http.get<Product[]>(`${API}/GetAll`);
    }

    let params = new HttpParams();
    if (f.vegeterian !== 'any') params = params.set('vegeterian', f.vegeterian);
    if (f.nuts !== 'any') params = params.set('nuts', f.nuts);
    if (f.spiciness !== 'any') params = params.set('spiciness', f.spiciness);

    return this.http.get<Product[]>(`${API}/GetFiltered`, { params });
  }

  trackById(_: number, p: Product) {
    return p.id;
  }

  reset() {
    this.form.reset();
  }
}
