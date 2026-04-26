import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class SpiderShapeCardSettings extends FormattingSettingsCard {
    shapeType: formattingSettings.ItemDropdown;
    startAngle: formattingSettings.Slider;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class GridLinesCardSettings extends FormattingSettingsCard {
    show: formattingSettings.ToggleSwitch;
    count: formattingSettings.Slider;
    color: formattingSettings.ColorPicker;
    strokeWidth: formattingSettings.Slider;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class AxisLabelsCardSettings extends FormattingSettingsCard {
    show: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class AxisScaleCardSettings extends FormattingSettingsCard {
    show: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class ValueLabelsCardSettings extends FormattingSettingsCard {
    show: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    color: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class DataPointCardSettings extends FormattingSettingsCard {
    fillOpacity: formattingSettings.Slider;
    strokeWidth: formattingSettings.Slider;
    showDots: formattingSettings.ToggleSwitch;
    dotSize: formattingSettings.Slider;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class SeriesColorsCardSettings extends FormattingSettingsCard {
    color1: formattingSettings.ColorPicker;
    color2: formattingSettings.ColorPicker;
    color3: formattingSettings.ColorPicker;
    color4: formattingSettings.ColorPicker;
    color5: formattingSettings.ColorPicker;
    color6: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class LegendCardSettings extends FormattingSettingsCard {
    show: formattingSettings.ToggleSwitch;
    fontSize: formattingSettings.NumUpDown;
    position: formattingSettings.ItemDropdown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class AutoScaleCardSettings extends FormattingSettingsCard {
    enabled: formattingSettings.ToggleSwitch;
    minOverride: formattingSettings.NumUpDown;
    maxOverride: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    spiderShapeCard: SpiderShapeCardSettings;
    gridLinesCard: GridLinesCardSettings;
    axisLabelsCard: AxisLabelsCardSettings;
    axisScaleCard: AxisScaleCardSettings;
    valueLabelsCard: ValueLabelsCardSettings;
    dataPointCard: DataPointCardSettings;
    seriesColorsCard: SeriesColorsCardSettings;
    legendCard: LegendCardSettings;
    autoScaleCard: AutoScaleCardSettings;
    cards: (SeriesColorsCardSettings | SpiderShapeCardSettings | GridLinesCardSettings | AxisLabelsCardSettings | AxisScaleCardSettings | ValueLabelsCardSettings | DataPointCardSettings | LegendCardSettings | AutoScaleCardSettings)[];
}
export {};
