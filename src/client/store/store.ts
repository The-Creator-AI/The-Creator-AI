import { BehaviorSubject } from "rxjs";

export class Store<T, A> extends BehaviorSubject<T> {
  constructor(private val: T) {
    super(val);
  }

  _next(value: T, action: A, actionVariant?: string): void {
    const devLogs = new URL(window.location.href).searchParams.has("devLogs");
    if (devLogs) {
      if (actionVariant) {
        console.log(action, actionVariant, value);
      } else {
        console.log(action, value);
      }
    }
    super.next(value);
  }
}
