import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'feature-users-paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  public readonly page = input.required<number>();
  public readonly limit = input.required<number>();
  public readonly total = input.required<number>();

  public readonly pageChange = output<number>();
  public readonly limitChange = output<number>();

  protected readonly limitOptions = [10, 20, 50, 100];

  protected readonly totalPages = computed(() =>
    Math.ceil(this.total() / this.limit()),
  );

  protected readonly hasPrev = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.totalPages());

  protected prev(): void {
    if (this.hasPrev()) this.pageChange.emit(this.page() - 1);
  }

  protected next(): void {
    if (this.hasNext()) this.pageChange.emit(this.page() + 1);
  }

  protected goTo(page: number): void {
    this.pageChange.emit(page);
  }

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const range: number[] = [];

    for (
      let i = Math.max(1, current - delta);
      i <= Math.min(total, current + delta);
      i++
    ) {
      range.push(i);
    }

    return range;
  });
}
