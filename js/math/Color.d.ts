export type colortuple = [number, number, number];
export declare enum ColorFormat {
    HSL = 0,
    RGB = 1,
    Hex = 2
}
export declare class Color {
    h: number;
    s: number;
    l: number;
    constructor();
    get HSL(): colortuple;
    set HSL([h, s, l]: colortuple);
    get RGB(): colortuple;
    set RGB(rgb: colortuple);
    get Hex(): string;
    set Hex(hex: string);
    get XYZ(): colortuple;
    set XYZ([x, y, z]: colortuple);
    get HCL(): colortuple;
    clone(): Color;
    toString(type?: ColorFormat): string;
    static HSL([h, s, l]: colortuple): Color;
    static RGB(rgb: colortuple): Color;
    static Hex(hex: string): Color;
    static HSLtoRGB([h, s, l]: colortuple): colortuple;
    static RGBtoHSL([r, g, b]: colortuple): colortuple;
    static HEXtoRGB(hexColor: string): colortuple;
    static RBGtoHEX([r, g, b]: colortuple): string;
}
export type colorable = string | (() => string) | Color;
export declare function resolveColorable(value: colorable): string;
