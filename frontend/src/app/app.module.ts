import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CurrencyMaskInputMode, NgxCurrencyModule } from 'ngx-currency';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { reducers, metaReducers } from './core/reducers';
import { authReducer } from './core/reducers/auth.reducers';
import { AuthEffects } from './core/effects/auth.effect';
import { InterceptService } from './services/intercept.service';

import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/pt';
import localeBrExtra from '@angular/common/locales/extra/pt';

registerLocaleData(localeBr, 'br', localeBrExtra);


export const customCurrencyMaskConfig = {
  align: "right",
  allowNegative: true,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: ".",
  nullable: true,
  min: null,
  max: null,
  inputMode: CurrencyMaskInputMode.FINANCIAL
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    ToastrModule.forRoot(),

    StoreModule.forRoot(reducers, { metaReducers }),
    StoreModule.forFeature('auth', authReducer),
    EffectsModule.forRoot([AuthEffects]),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'br' },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptService, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
