import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-feature-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './feature-shell.component.html',
  styleUrl: './feature-shell.component.scss',
})
export class FeatureShellComponent {}
