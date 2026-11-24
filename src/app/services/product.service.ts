import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilters } from '../models';

const API = 'https://restaurant.stepprojects.ge/api/Products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getProducts(f: ProductFilters): Observable<Product[]> {
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
}
