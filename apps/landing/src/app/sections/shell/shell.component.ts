import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { HeroComponent } from '../hero/hero.component';
import { MarqueeComponent } from '../marquee/marquee.component';
import { HowComponent } from '../how/how.component';
import { ModulesComponent } from '../modules/modules.component';
import { PricingComponent } from '../pricing/pricing.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { ContactComponent } from '../contact/contact.component';
import { CtaComponent } from '../cta/cta.component';
import { FooterComponent } from '../footer/footer.component';
import { WhatsappButtonComponent } from '../../shared/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'app-landing-shell',
  standalone: true,
  imports: [
    NavComponent,
    HeroComponent,
    MarqueeComponent,
    HowComponent,
    ModulesComponent,
    PricingComponent,
    TestimonialsComponent,
    ContactComponent,
    CtaComponent,
    FooterComponent,
    WhatsappButtonComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
