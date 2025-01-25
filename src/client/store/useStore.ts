import { useEffect, useState } from "react";
import { Store } from "./store";

export const useSelector = <S, A, R>(
  subject: Store<S, A>,
  selector: (state: S) => R
) => {
  const [state, setState] = useState<S>(subject.getValue());

  useEffect(() => {
    const subscription = subject.subscribe((newState) => {
      if (selector(newState) !== selector(state)) {
        setState(newState);
      }
    });

    return () => subscription.unsubscribe();
  }, [subject, selector]);

  return selector(state);
};

export const useStore = <S, A>(subject: Store<S, A>) => {
  return useSelector(subject, (state) => state);
};
