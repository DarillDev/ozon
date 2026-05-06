## DestroyerService

### Description

The service can be used for convenient unsubscribing.

### Usage

- Create a `destroyer` using the `createDestroyer` function
- Use `destroyer()` in `pipe` where you are going to unsubscribe

```ts
@Component()
class SomeComponent implements OnInit {
  private readonly destroyer = createDestroyer();

  public ngOnInit(): void {
    interval(100).pipe(this.destroyer()).subscribe();
  }
}
```

### Why is it more convenient to use the service?

The traditional way to unsubscribe requires:

- Implementation of `OnDestroy`;
- Declaration of `Subject` in the component;
- Adding unsubscribe code to `ngOnDestroy` hook;

```ts
@Component({})
class SomeComponent implements OnInit, OnDestroy {
  private readonly destroyer$ = new Subject<void>();

  public ngOnDestroy(): void {
    this.destroyer$.unsubscribe();
    this.destroyer$.complete();
  }

  public ngOnInit(): void {
    interval(100).pipe(takeUntil(this.destroyer$)).subscribe();
  }
}
```

If we compare the traditional method with the method through the service, we will see that we need fewer lines of code to unsubscribe,
but most importantly, there is no need to implement the `OnDestroy` hook.

### Why the service is better than decorators like `@UntilDestroy` or operators like `takeUntilDestroyed`

The decorator and operator mentioned use a private api, do a dirty patch on the `ngOnDestroy` hook.
This is very risky, because when migrating to new versions of angular, such mechanisms can easily break.
The service, on the other hand, uses the standard tools provided by Angular, which are unlikely to ever break.
