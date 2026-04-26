"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const DEFAULT_COLORS = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"
];

class SpiderShapeCardSettings extends FormattingSettingsCard {
    shapeType = new formattingSettings.ItemDropdown({
        name: "shapeType",
        displayName: "Shape Type",
        items: [
            { value: "polygon", displayName: "Polygon" },
            { value: "circle", displayName: "Circle" }
        ],
        value: { value: "polygon", displayName: "Polygon" }
    });

    startAngle = new formattingSettings.Slider({
        name: "startAngle",
        displayName: "Start Angle",
        value: -90,
        options: {
            minValue: { value: -180, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 180, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "spiderShape";
    displayName: string = "Spider Shape";
    slices: Array<FormattingSettingsSlice> = [this.shapeType, this.startAngle];
}

class GridLinesCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show Grid",
        value: true
    });

    count = new formattingSettings.Slider({
        name: "count",
        displayName: "Grid Levels",
        value: 5,
        options: {
            minValue: { value: 2, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 15, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Grid Color",
        value: { value: "#CCCCCC" }
    });

    strokeWidth = new formattingSettings.Slider({
        name: "strokeWidth",
        displayName: "Grid Width",
        value: 1,
        options: {
            minValue: { value: 0.5, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 5, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "gridLines";
    displayName: string = "Grid Lines";
    slices: Array<FormattingSettingsSlice> = [this.show, this.count, this.color, this.strokeWidth];
}

class AxisLabelsCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show Labels",
        value: true
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 11
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Label Color",
        value: { value: "#333333" }
    });

    name: string = "axisLabels";
    displayName: string = "Axis Labels";
    slices: Array<FormattingSettingsSlice> = [this.show, this.fontSize, this.color];
}

class AxisScaleCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show Scale Values",
        value: false
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 8
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Scale Color",
        value: { value: "#999999" }
    });

    name: string = "axisScale";
    displayName: string = "Axis Scale";
    slices: Array<FormattingSettingsSlice> = [this.show, this.fontSize, this.color];
}

class ValueLabelsCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show Values",
        value: false
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 9
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Value Color",
        value: { value: "#666666" }
    });

    name: string = "valueLabels";
    displayName: string = "Value Labels";
    slices: Array<FormattingSettingsSlice> = [this.show, this.fontSize, this.color];
}

class DataPointCardSettings extends FormattingSettingsCard {
    fillOpacity = new formattingSettings.Slider({
        name: "fillOpacity",
        displayName: "Fill Opacity",
        value: 25,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 100, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    strokeWidth = new formattingSettings.Slider({
        name: "strokeWidth",
        displayName: "Stroke Width",
        value: 2,
        options: {
            minValue: { value: 0.5, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 8, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showDots = new formattingSettings.ToggleSwitch({
        name: "showDots",
        displayName: "Show Dots",
        value: true
    });

    dotSize = new formattingSettings.Slider({
        name: "dotSize",
        displayName: "Dot Size",
        value: 4,
        options: {
            minValue: { value: 1, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 12, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "dataPoint";
    displayName: string = "Data Points";
    slices: Array<FormattingSettingsSlice> = [this.fillOpacity, this.strokeWidth, this.showDots, this.dotSize];
}

class SeriesColorsCardSettings extends FormattingSettingsCard {
    color1 = new formattingSettings.ColorPicker({
        name: "color1",
        displayName: "Series 1",
        value: { value: DEFAULT_COLORS[0] }
    });
    color2 = new formattingSettings.ColorPicker({
        name: "color2",
        displayName: "Series 2",
        value: { value: DEFAULT_COLORS[1] }
    });
    color3 = new formattingSettings.ColorPicker({
        name: "color3",
        displayName: "Series 3",
        value: { value: DEFAULT_COLORS[2] }
    });
    color4 = new formattingSettings.ColorPicker({
        name: "color4",
        displayName: "Series 4",
        value: { value: DEFAULT_COLORS[3] }
    });
    color5 = new formattingSettings.ColorPicker({
        name: "color5",
        displayName: "Series 5",
        value: { value: DEFAULT_COLORS[4] }
    });
    color6 = new formattingSettings.ColorPicker({
        name: "color6",
        displayName: "Series 6",
        value: { value: DEFAULT_COLORS[5] }
    });

    name: string = "seriesColors";
    displayName: string = "Series Colors";
    slices: Array<FormattingSettingsSlice> = [
        this.color1, this.color2, this.color3,
        this.color4, this.color5, this.color6
    ];
}

class LegendCardSettings extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show Legend",
        value: true
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font Size",
        value: 11
    });

    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Position",
        items: [
            { value: "top", displayName: "Top" },
            { value: "bottom", displayName: "Bottom" },
            { value: "left", displayName: "Left" },
            { value: "right", displayName: "Right" }
        ],
        value: { value: "bottom", displayName: "Bottom" }
    });

    name: string = "legend";
    displayName: string = "Legend";
    slices: Array<FormattingSettingsSlice> = [this.show, this.fontSize, this.position];
}

class AutoScaleCardSettings extends FormattingSettingsCard {
    enabled = new formattingSettings.ToggleSwitch({
        name: "enabled",
        displayName: "Auto Scale",
        value: true
    });

    minOverride = new formattingSettings.NumUpDown({
        name: "minOverride",
        displayName: "Min Value Override",
        value: 0
    });

    maxOverride = new formattingSettings.NumUpDown({
        name: "maxOverride",
        displayName: "Max Value Override",
        value: 100
    });

    name: string = "autoScale";
    displayName: string = "Scale Settings";
    slices: Array<FormattingSettingsSlice> = [this.enabled, this.minOverride, this.maxOverride];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    spiderShapeCard = new SpiderShapeCardSettings();
    gridLinesCard = new GridLinesCardSettings();
    axisLabelsCard = new AxisLabelsCardSettings();
    axisScaleCard = new AxisScaleCardSettings();
    valueLabelsCard = new ValueLabelsCardSettings();
    dataPointCard = new DataPointCardSettings();
    seriesColorsCard = new SeriesColorsCardSettings();
    legendCard = new LegendCardSettings();
    autoScaleCard = new AutoScaleCardSettings();

    cards = [
        this.spiderShapeCard,
        this.gridLinesCard,
        this.axisLabelsCard,
        this.axisScaleCard,
        this.valueLabelsCard,
        this.dataPointCard,
        this.seriesColorsCard,
        this.legendCard,
        this.autoScaleCard
    ];
}
