import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StandaloneComponent } from './standalone/standalone.component';
import { environment } from '../environments/environment';
import { CoreModule as AbpCoreModule, provideAbpCore, withOptions } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { ThemeSharedModule, provideAbpThemeShared } from '@abp/ng.theme.shared';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { ServicesModule } from './services/services.module';
import { CoreModule } from './core/core.module';
import { CommandDispatcherService } from './core/commands/command-dispatcher.service';
import {
  COMMAND_HANDLER_PROVIDERS,
  commandHandlerRegistrationFactory,
} from './command-handler-providers';
import { TestingModule } from './testing/testing.module';
import { CommandHandlerRegistry } from './core/commands/command';
import { CommandLocalizationService } from './core/commands/command-localization.service';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Initialize translations
export function initTranslations(translate: TranslateService) {
  return () => {
    // Set default and fallback languages
    translate.setDefaultLang('en');
    translate.addLangs(['en', 'ar']);

    // Determine browser language if available, otherwise use default
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|ar/) ? browserLang : 'en');

    console.log('[AppModule] Translations initialized with language:', translate.currentLang);
    return Promise.resolve(true);
  };
}

// Initialize command handlers after translations are loaded
export function initializeCommandHandlers(
  registry: CommandHandlerRegistry,
  localizationService: CommandLocalizationService,
  injector: Injector
) {
  return () => {
    console.log('[AppModule] Initializing command handlers...');

    // Let translations fully load before initializing commands
    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        try {
          const factory = commandHandlerRegistrationFactory(
            registry,
            localizationService,
            injector
          );
          const result = factory();
          console.log('[AppModule] Command handlers initialized');
          resolve(true);
        } catch (error) {
          console.error('[AppModule] Error initializing command handlers:', error);
          resolve(false);
        }
      }, 500);
    });
  };
}

@NgModule({
  declarations: [AppComponent, StandaloneComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CoreModule, // Import our core module
    AbpCoreModule,
    ThemeSharedModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      isolate: false,
      defaultLanguage: 'en',
    }),
    SharedModule,
    ServicesModule,
    TestingModule,
  ],
  providers: [
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocale(),
      })
    ),
    provideAbpThemeShared(),
    // Comment out the OAuth provider to disable OpenID Connect during development
    // provideAbpOAuth(),

    // Add command handler providers
    ...COMMAND_HANDLER_PROVIDERS,

    // Initialize translations first
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },

    // Initialize CommandDispatcherService during app bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCommandHandlers,
      deps: [CommandHandlerRegistry, CommandLocalizationService, Injector],
      multi: true,
    },
    CommandDispatcherService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private commandDispatcher: CommandDispatcherService,
    private translate: TranslateService
  ) {
    console.log('AppModule initialized with command dispatcher and translations');
  }
}
