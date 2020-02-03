import React from "react";
import { HookedComponent } from "src/lib/hooklib";
export interface MYCOMPONENTProps extends _DefaultProps, React.PropsWithChildren<{}> {
  // required props here
}
class _DefaultProps {/* props with default values here */}
/**
 * TODO: add description
 * note that in JSX you need to use <MYCOMPONENT.JSX>
 */
class _MYCOMPONENT extends HookedComponent<MYCOMPONENTProps> {
  public useRender(props: MYCOMPONENTProps) {
    return null; // TODO
  }
}
export const MYCOMPONENT = HookedComponent.finalize(_MYCOMPONENT, new _DefaultProps());
export type MYCOMPONENT = _MYCOMPONENT;
