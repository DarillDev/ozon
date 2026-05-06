import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersApiService } from '@ozon/frontend/data-access-api/controllers/users';
import { AssetsApiService } from '@ozon/frontend/data-access-api/controllers/assets';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly usersApiService = inject(UsersApiService);
  private readonly assetsApiService = inject(AssetsApiService);

  protected readonly usersList = toSignal(this.usersApiService.getUsers(), {
    initialValue: [],
  });

  protected readonly assetsList = toSignal(
    this.assetsApiService.getAssetsStream(),
    {
      initialValue: [],
    },
  );
}
