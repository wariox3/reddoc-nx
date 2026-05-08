import { Component, computed, inject, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { UserAvatarService } from '@reddoc/core';

@Component({
  selector: 'lib-user-avatar',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  private readonly avatar = inject(UserAvatarService);

  readonly size = input<number>(36);
  readonly variant = input<'thumbnail' | 'full'>('thumbnail');
  readonly styleClass = input<string>('');

  readonly imageUrl = computed(() =>
    this.variant() === 'full' ? this.avatar.fullProfileImage() : this.avatar.profileImage(),
  );
  readonly initials = this.avatar.initials;

  readonly hostClass = computed(() => `lib-user-avatar ${this.styleClass()}`.trim());
}
