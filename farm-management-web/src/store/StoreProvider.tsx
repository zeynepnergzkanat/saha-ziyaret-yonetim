"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { hydrateAuth } from "./authSlice";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}