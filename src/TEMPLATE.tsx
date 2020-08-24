// use *hookcls snippet to generate the template.

import React from "react";
import { HookCls } from "src/lib/hookcls";
/** all props for MYCOMP */
interface MYCOMP_AllProps extends React.PropsWithChildren<MYCOMP_DefProps> {} // required props go in here.
/** props defined with default values. */
class MYCOMP_DefProps {
    // props with default values here. remember to document all props
}
/**
 * TODO: DESCRIBE CLASS HERE
 */
export class MYCOMP_Cls extends HookCls<MYCOMP_AllProps> {
    public static defaultProps = new MYCOMP_DefProps();
    protected useRender(props: MYCOMP_AllProps) {
        // can call hooks here. fill in rendering.
        return <>{props.children}</>;
    }
}
/**
 * react component to implement MYCOMP_Cls hook class.
 * @see MYCOMP_Cls for full details.
 */
export const MYCOMP = MYCOMP_Cls.createComponent();
/** type is an alias to MYCOMP_Cls so that importing react component also imports ref type */
export type MYCOMP = MYCOMP_Cls;
export default MYCOMP;
/** props for MYCOMP taking into account default props being optional */
export type MYCOMPProps = Omit<MYCOMP_AllProps, keyof MYCOMP_DefProps> & Partial<MYCOMP_AllProps>;
