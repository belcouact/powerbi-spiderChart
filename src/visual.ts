"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import * as d3 from "d3";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import ISelectionId = powerbi.visuals.ISelectionId;
import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import { VisualFormattingSettingsModel } from "./settings";

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

interface SpiderDataPoint {
    category: string;
    categoryIndex: number;
    value: number;
    seriesIndex: number;
    seriesName: string;
    selectionId: ISelectionId;
    highlightRatio?: number;
}

interface SpiderSeries {
    name: string;
    color: string;
    dataPoints: SpiderDataPoint[];
}

interface AxisScale {
    min: number;
    max: number;
    step: number;
    ticks: number[];
}

interface SpiderViewModel {
    categories: string[];
    series: SpiderSeries[];
    useGlobalScale: boolean;
    globalMin: number;
    globalMax: number;
    axisScales: AxisScale[];
}

const DEFAULT_PALETTE = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"
];

function niceNum(range: number, round: boolean): number {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction: number;
    if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
    } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
}

function calculateNiceScale(minVal: number, maxVal: number, tickCount: number = 5): AxisScale {
    if (minVal === maxVal) {
        minVal = minVal > 0 ? 0 : minVal - 1;
        maxVal = maxVal < 0 ? 0 : maxVal + 1;
    }
    const range = niceNum(maxVal - minVal, false);
    const step = niceNum(range / (tickCount - 1), true);
    const niceMin = Math.floor(minVal / step) * step;
    const niceMax = Math.ceil(maxVal / step) * step;
    const ticks: number[] = [];
    for (let v = niceMin; v <= niceMax + step * 0.01; v += step) {
        ticks.push(parseFloat(v.toFixed(10)));
    }
    return { min: niceMin, max: niceMax, step, ticks };
}

function getSeriesColor(settings: VisualFormattingSettingsModel, index: number): string {
    const colorProps = [
        settings.seriesColorsCard.color1,
        settings.seriesColorsCard.color2,
        settings.seriesColorsCard.color3,
        settings.seriesColorsCard.color4,
        settings.seriesColorsCard.color5,
        settings.seriesColorsCard.color6
    ];
    if (index < colorProps.length && colorProps[index].value.value) {
        return colorProps[index].value.value;
    }
    return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}

function formatValue(val: number): string {
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + "M";
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + "K";
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(1);
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private svg: Selection<SVGSVGElement>;
    private mainGroup: Selection<SVGGElement>;
    private host: powerbi.extensibility.visual.IVisualHost;
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.target = options.element;

        this.svg = d3.select(this.target)
            .append("svg")
            .classed("spider-chart", true);

        this.mainGroup = this.svg.append("g").classed("spider-main", true);
    }

    public update(options: VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews[0]) return;
        const dataView = options.dataViews[0];

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, dataView
        );

        const viewModel = this.transformData(dataView);
        if (!viewModel || viewModel.categories.length < 3) {
            this.showNoDataMessage();
            return;
        }

        this.clearSVG();
        this.renderSpiderChart(viewModel, options.viewport);
    }

    private transformData(dataView: DataView): SpiderViewModel | null {
        const categorical = dataView.categorical;
        if (!categorical || !categorical.categories || !categorical.values) return null;

        const categories = categorical.categories[0];
        if (!categories || !categories.values || categories.values.length < 3) return null;

        const categoryNames: string[] = categories.values.map((v: PrimitiveValue) => String(v || ""));
        const settings = this.formattingSettings;
        const isAutoScale = settings.autoScaleCard.enabled.value;
        const gridCount = Math.max(2, Math.round(settings.gridLinesCard.count.value));

        const series: SpiderSeries[] = [];
        const values = categorical.values;
        const grouped = values.grouped();

        const axisMinValues: number[] = new Array(categoryNames.length).fill(Infinity);
        const axisMaxValues: number[] = new Array(categoryNames.length).fill(-Infinity);
        let globalMin = Infinity;
        let globalMax = -Infinity;

        const seriesDataMap: Map<number, SpiderDataPoint[]> = new Map();

        const collectValues = (colValues: PrimitiveValue[], highlights: (PrimitiveValue | null)[] | undefined,
            seriesIdx: number, seriesName: string, color: string) => {
            if (!seriesDataMap.has(seriesIdx)) {
                seriesDataMap.set(seriesIdx, []);
            }
            const dataPoints = seriesDataMap.get(seriesIdx)!;

            for (let i = 0; i < colValues.length; i++) {
                const rawVal = <number>colValues[i];
                if (rawVal === null || rawVal === undefined || isNaN(rawVal)) continue;
                const highlight = highlights ? highlights[i] : undefined;
                const highlightRatio = highlight !== null && highlight !== undefined && rawVal !== 0
                    ? <number>highlight / rawVal : 1;

                const selectionIdBuilder = this.host.createSelectionIdBuilder()
                    .withCategory(categories, i);

                dataPoints.push({
                    category: categoryNames[i],
                    categoryIndex: i,
                    value: rawVal,
                    seriesIndex: seriesIdx,
                    seriesName,
                    selectionId: selectionIdBuilder.createSelectionId(),
                    highlightRatio
                });

                if (rawVal < axisMinValues[i]) axisMinValues[i] = rawVal;
                if (rawVal > axisMaxValues[i]) axisMaxValues[i] = rawVal;
                if (rawVal < globalMin) globalMin = rawVal;
                if (rawVal > globalMax) globalMax = rawVal;
            }
        };

        if (grouped && grouped.length > 0) {
            for (let seriesIdx = 0; seriesIdx < grouped.length; seriesIdx++) {
                const group = grouped[seriesIdx];
                const seriesName = group.name ? String(group.name) : `Series ${seriesIdx + 1}`;
                const color = getSeriesColor(settings, seriesIdx);

                for (let colIdx = 0; colIdx < group.values.length; colIdx++) {
                    const col = group.values[colIdx];
                    if (!col.values) continue;
                    collectValues(col.values, col.highlights, seriesIdx, seriesName, color);
                }
            }
        } else {
            for (let seriesIdx = 0; seriesIdx < values.length; seriesIdx++) {
                const col = values[seriesIdx];
                const seriesName = col.source ? col.source.displayName : `Series ${seriesIdx + 1}`;
                const color = getSeriesColor(settings, seriesIdx);
                if (!col.values) continue;
                collectValues(col.values, col.highlights, seriesIdx, seriesName, color);
            }
        }

        seriesDataMap.forEach((dataPoints, seriesIdx) => {
            if (dataPoints.length > 0) {
                const firstDp = dataPoints[0];
                series.push({
                    name: firstDp.seriesName,
                    color: getSeriesColor(settings, seriesIdx),
                    dataPoints
                });
            }
        });

        if (series.length === 0) return null;

        const overrideMin = settings.autoScaleCard.minOverride.value;
        const overrideMax = settings.autoScaleCard.maxOverride.value;

        let axisScales: AxisScale[] = [];
        let useGlobalScale = true;
        let finalGlobalMin: number;
        let finalGlobalMax: number;

        if (isAutoScale) {
            useGlobalScale = false;
            for (let i = 0; i < categoryNames.length; i++) {
                const aMin = Math.min(axisMinValues[i], overrideMin);
                const aMax = axisMaxValues[i];
                const scale = calculateNiceScale(aMin, aMax, gridCount);
                axisScales.push(scale);
            }
            finalGlobalMin = 0;
            finalGlobalMax = 1;
        } else {
            finalGlobalMin = overrideMin;
            finalGlobalMax = overrideMax;
            const globalScale = calculateNiceScale(finalGlobalMin, finalGlobalMax, gridCount);
            axisScales = categoryNames.map(() => globalScale);
        }

        if (finalGlobalMax <= finalGlobalMin) finalGlobalMax = finalGlobalMin + 1;

        return {
            categories: categoryNames,
            series,
            useGlobalScale,
            globalMin: finalGlobalMin,
            globalMax: finalGlobalMax,
            axisScales
        };
    }

    private clearSVG() {
        this.mainGroup.selectAll("*").remove();
    }

    private showNoDataMessage() {
        this.clearSVG();
        const { width, height } = this.getViewport();
        this.svg.attr("width", width).attr("height", height);
        this.mainGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#999")
            .attr("font-size", "14px")
            .text("Add at least 3 categories and a measure to see the spider chart");
    }

    private getViewport(): { width: number; height: number } {
        return {
            width: Math.max(0, this.target.clientWidth || 400),
            height: Math.max(0, this.target.clientHeight || 400)
        };
    }

    private renderSpiderChart(viewModel: SpiderViewModel, viewport: powerbi.IViewport) {
        const settings = this.formattingSettings;
        const width = viewport.width || this.target.clientWidth;
        const height = viewport.height || this.target.clientHeight;

        this.svg.attr("width", width).attr("height", height);

        const legendPosition = settings.legendCard.position.value.value as string;
        const showLegend = settings.legendCard.show.value && viewModel.series.length > 1;
        const legendFontSize = settings.legendCard.fontSize.value;

        let chartArea = { left: 0, top: 0, width, height };

        if (showLegend) {
            const legendSpace = 30 + viewModel.series.length * (legendFontSize + 6);
            switch (legendPosition) {
                case "top":
                    chartArea.top = legendSpace;
                    chartArea.height -= legendSpace;
                    break;
                case "bottom":
                    chartArea.height -= legendSpace;
                    break;
                case "left":
                    chartArea.left = legendSpace;
                    chartArea.width -= legendSpace;
                    break;
                case "right":
                    chartArea.width -= legendSpace;
                    break;
            }
        }

        const centerX = chartArea.left + chartArea.width / 2;
        const centerY = chartArea.top + chartArea.height / 2;
        const radius = Math.min(chartArea.width, chartArea.height) / 2 - 40;
        if (radius <= 0) return;

        const numAxes = viewModel.categories.length;
        const startAngleDeg = settings.spiderShapeCard.startAngle.value;
        const startAngleRad = (startAngleDeg * Math.PI) / 180;
        const angleSlice = (2 * Math.PI) / numAxes;
        const shapeType = settings.spiderShapeCard.shapeType.value.value as string;
        const gridCount = Math.max(2, Math.round(settings.gridLinesCard.count.value));
        const gridColor = settings.gridLinesCard.color.value.value || "#CCCCCC";
        const gridWidth = settings.gridLinesCard.strokeWidth.value;

        const getPoint = (axisIndex: number, value: number): [number, number] => {
            const angle = startAngleRad + axisIndex * angleSlice - Math.PI / 2;
            const scale = viewModel.axisScales[axisIndex];
            const ratio = (value - scale.min) / (scale.max - scale.min);
            const r = ratio * radius;
            return [centerX + r * Math.cos(angle), centerY + r * Math.sin(angle)];
        };

        const getPointGlobal = (axisIndex: number, value: number): [number, number] => {
            const angle = startAngleRad + axisIndex * angleSlice - Math.PI / 2;
            const ratio = (value - viewModel.globalMin) / (viewModel.globalMax - viewModel.globalMin);
            const r = ratio * radius;
            return [centerX + r * Math.cos(angle), centerY + r * Math.sin(angle)];
        };

        const gridGroup = this.mainGroup.append("g").classed("spider-grid", true);

        if (settings.gridLinesCard.show.value) {
            if (viewModel.useGlobalScale) {
                const globalScale = viewModel.axisScales[0];
                for (let level = 1; level <= gridCount; level++) {
                    const levelValue = globalScale.min + (globalScale.max - globalScale.min) * level / gridCount;

                    if (shapeType === "circle") {
                        const circleR = ((levelValue - globalScale.min) / (globalScale.max - globalScale.min)) * radius;
                        gridGroup.append("circle")
                            .attr("cx", centerX)
                            .attr("cy", centerY)
                            .attr("r", circleR)
                            .attr("fill", "none")
                            .attr("stroke", gridColor)
                            .attr("stroke-width", gridWidth)
                            .attr("stroke-dasharray", level < gridCount ? "3,3" : "none");
                    } else {
                        const points: [number, number][] = [];
                        for (let i = 0; i < numAxes; i++) {
                            points.push(getPoint(i, levelValue));
                        }
                        const line = d3.line<[number, number]>()([
                            ...points, points[0]
                        ]);
                        gridGroup.append("path")
                            .attr("d", line)
                            .attr("fill", "none")
                            .attr("stroke", gridColor)
                            .attr("stroke-width", gridWidth)
                            .attr("stroke-dasharray", level < gridCount ? "3,3" : "none");
                    }
                }
            } else {
                for (let level = 1; level <= gridCount; level++) {
                    const points: [number, number][] = [];
                    for (let i = 0; i < numAxes; i++) {
                        const scale = viewModel.axisScales[i];
                        const levelValue = scale.min + (scale.max - scale.min) * level / gridCount;
                        points.push(getPoint(i, levelValue));
                    }
                    const line = d3.line<[number, number]>()([
                        ...points, points[0]
                    ]);
                    gridGroup.append("path")
                        .attr("d", line)
                        .attr("fill", "none")
                        .attr("stroke", gridColor)
                        .attr("stroke-width", gridWidth)
                        .attr("stroke-dasharray", level < gridCount ? "3,3" : "none");
                }
            }
        }

        const axisGroup = this.mainGroup.append("g").classed("spider-axes", true);
        for (let i = 0; i < numAxes; i++) {
            const angle = startAngleRad + i * angleSlice - Math.PI / 2;
            const outerX = centerX + radius * Math.cos(angle);
            const outerY = centerY + radius * Math.sin(angle);

            axisGroup.append("line")
                .attr("x1", centerX)
                .attr("y1", centerY)
                .attr("x2", outerX)
                .attr("y2", outerY)
                .attr("stroke", gridColor)
                .attr("stroke-width", Math.max(0.5, gridWidth * 0.5));

            if (settings.axisLabelsCard.show.value) {
                const labelR = radius + 16;
                const labelX = centerX + labelR * Math.cos(angle);
                const labelY = centerY + labelR * Math.sin(angle);
                const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle"
                    : Math.cos(angle) > 0 ? "start" : "end";

                axisGroup.append("text")
                    .attr("x", labelX)
                    .attr("y", labelY)
                    .attr("text-anchor", textAnchor)
                    .attr("dominant-baseline", "central")
                    .attr("fill", settings.axisLabelsCard.color.value.value || "#333333")
                    .attr("font-size", settings.axisLabelsCard.fontSize.value + "px")
                    .text(viewModel.categories[i]);
            }

            if (settings.axisScaleCard.show.value) {
                const scale = viewModel.axisScales[i];
                const scaleColor = settings.axisScaleCard.color.value.value || "#999999";
                const scaleFontSize = settings.axisScaleCard.fontSize.value;

                for (let t = 1; t < scale.ticks.length; t++) {
                    const tickVal = scale.ticks[t];
                    const ratio = (tickVal - scale.min) / (scale.max - scale.min);
                    const tickR = ratio * radius;
                    const tickX = centerX + tickR * Math.cos(angle);
                    const tickY = centerY + tickR * Math.sin(angle);

                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const offset = 6;
                    const tx = tickX + offset * cosA;
                    const ty = tickY + offset * sinA;

                    const textAnchor = Math.abs(cosA) < 0.1 ? "middle"
                        : cosA > 0 ? "start" : "end";

                    axisGroup.append("text")
                        .attr("x", tx)
                        .attr("y", ty)
                        .attr("text-anchor", textAnchor)
                        .attr("dominant-baseline", "central")
                        .attr("fill", scaleColor)
                        .attr("font-size", scaleFontSize + "px")
                        .text(formatValue(tickVal));
                }
            }
        }

        const dataGroup = this.mainGroup.append("g").classed("spider-data", true);
        const fillOpacity = settings.dataPointCard.fillOpacity.value / 100;
        const strokeWidth = settings.dataPointCard.strokeWidth.value;
        const showDots = settings.dataPointCard.showDots.value;
        const dotSize = settings.dataPointCard.dotSize.value;

        const lineGen = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveLinearClosed);

        interface LabelConfig {
            text: string;
            positions: { x: number; y: number }[];
            anchor: string;
            width: number;
            height: number;
            seriesIdx: number;
            dp: SpiderDataPoint;
        }

        const allLabelConfigs: LabelConfig[] = [];

        if (settings.valueLabelsCard.show.value) {
            const labelFontSize = settings.valueLabelsCard.fontSize.value;
            const charWidth = labelFontSize * 0.55;
            const labelHeight = labelFontSize * 1.4;
            const baseOffset = dotSize + 5;

            viewModel.series.forEach((s, sIdx) => {
                s.dataPoints.forEach((dp) => {
                    const pt = getPoint(dp.categoryIndex, dp.value);
                    const angle = startAngleRad + dp.categoryIndex * angleSlice - Math.PI / 2;
                    const text = formatValue(dp.value);
                    const textW = text.length * charWidth;
                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const anchor = Math.abs(cosA) < 0.1 ? "middle" : cosA > 0 ? "start" : "end";

                    const offsets = [
                        baseOffset + 2,
                        baseOffset + 16,
                        baseOffset + 30,
                        baseOffset + 44,
                    ];

                    const positions = offsets.map((off) => ({
                        x: pt[0] + cosA * (off + textW / 2),
                        y: pt[1] + sinA * (off + labelHeight / 2),
                    }));

                    allLabelConfigs.push({ text, positions, anchor, width: textW, height: labelHeight, seriesIdx: sIdx, dp });
                });
            });
        }

        viewModel.series.forEach((s, seriesIdx) => {
            const seriesGroup = dataGroup.append("g")
                .classed("spider-series", true)
                .attr("data-series", s.name);

            const points: [number, number][] = [];
            const highlightPoints: [number, number][] = [];

            s.dataPoints.forEach((dp) => {
                const pt = getPoint(dp.categoryIndex, dp.value);
                points.push(pt);

                if (dp.highlightRatio !== undefined && dp.highlightRatio < 1) {
                    const scale = viewModel.axisScales[dp.categoryIndex];
                    const highlightVal = scale.min + (dp.value - scale.min) * dp.highlightRatio;
                    highlightPoints.push(getPoint(dp.categoryIndex, highlightVal));
                } else {
                    highlightPoints.push(pt);
                }
            });

            if (points.length < 3) return;

            seriesGroup.append("path")
                .attr("d", lineGen(points))
                .attr("fill", s.color)
                .attr("fill-opacity", fillOpacity * 0.3)
                .attr("stroke", "none");

            seriesGroup.append("path")
                .attr("d", lineGen(highlightPoints))
                .attr("fill", s.color)
                .attr("fill-opacity", fillOpacity)
                .attr("stroke", s.color)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-linejoin", "round");

            if (showDots) {
                s.dataPoints.forEach((dp) => {
                    const pt = getPoint(dp.categoryIndex, dp.value);
                    const dot = seriesGroup.append("circle")
                        .attr("cx", pt[0])
                        .attr("cy", pt[1])
                        .attr("r", dotSize)
                        .attr("fill", s.color)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1.5)
                        .style("cursor", "pointer");

                    dot.on("click", () => {
                        this.selectionManager.select(dp.selectionId, true);
                    });

                    dot.on("mouseover", (event: MouseEvent) => {
                        const tooltipData = [
                            { displayName: dp.category, value: dp.value.toString() },
                            { displayName: "Series", value: dp.seriesName }
                        ];
                        this.host.tooltipService.show({
                            coordinates: [event.clientX, event.clientY],
                            isTouchEvent: false,
                            dataItems: tooltipData,
                            identities: [dp.selectionId]
                        });
                    });

                    dot.on("mouseout", () => {
                        this.host.tooltipService.hide({
                            isTouchEvent: false,
                            immediately: true
                        });
                    });
                });
            }

            const seriesLabels = allLabelConfigs.filter((lc) => lc.seriesIdx === seriesIdx);
            if (seriesLabels.length > 0) {
                const labelColor = settings.valueLabelsCard.color.value.value || "#666666";
                const labelFontSize = settings.valueLabelsCard.fontSize.value;

                interface PlacedLabel {
                    x: number;
                    y: number;
                    text: string;
                    anchor: string;
                    width: number;
                    height: number;
                }

                const globallyPlaced: PlacedLabel[] = [];

                function boxesOverlap(nx: number, ny: number, nw: number, nh: number, nAnchor: string, existing: PlacedLabel): boolean {
                    const pad = 1;
                    const ax1 = nAnchor === "start" ? nx - pad : nAnchor === "end" ? nx - nw - pad : nx - nw / 2 - pad;
                    const ax2 = nAnchor === "start" ? nx + nw + pad : nAnchor === "end" ? nx + pad : nx + nw / 2 + pad;
                    const ay1 = ny - nh / 2 - pad;
                    const ay2 = ny + nh / 2 + pad;

                    const bx1 = existing.anchor === "start" ? existing.x - pad : existing.anchor === "end" ? existing.x - existing.width - pad : existing.x - existing.width / 2 - pad;
                    const bx2 = existing.anchor === "start" ? existing.x + existing.width + pad : existing.anchor === "end" ? existing.x + pad : existing.x + existing.width / 2 + pad;
                    const by1 = existing.y - existing.height / 2 - pad;
                    const by2 = existing.y + existing.height / 2 + pad;

                    return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
                }

                function conflictsGlobally(nx: number, ny: number, nw: number, nh: number, nAnchor: string): boolean {
                    for (const p of globallyPlaced) {
                        if (boxesOverlap(nx, ny, nw, nh, nAnchor, p)) return true;
                    }
                    return false;
                }

                seriesLabels.forEach((cfg) => {
                    for (const pos of cfg.positions) {
                        if (!conflictsGlobally(pos.x, pos.y, cfg.width, cfg.height, cfg.anchor)) {
                            seriesGroup.append("text")
                                .attr("x", pos.x)
                                .attr("y", pos.y)
                                .attr("text-anchor", cfg.anchor)
                                .attr("dominant-baseline", "central")
                                .attr("fill", labelColor)
                                .attr("font-size", labelFontSize + "px")
                                .attr("font-weight", "600")
                                .text(cfg.text);

                            globallyPlaced.push({ x: pos.x, y: pos.y, text: cfg.text, anchor: cfg.anchor, width: cfg.width, height: cfg.height });
                            break;
                        }
                    }
                });
            }
        });

        if (showLegend) {
            this.renderLegend(viewModel, chartArea, settings);
        }
    }

    private renderLegend(viewModel: SpiderViewModel, chartArea: { left: number; top: number; width: number; height: number }, settings: VisualFormattingSettingsModel) {
        const legendGroup = this.mainGroup.append("g").classed("spider-legend", true);
        const fontSize = settings.legendCard.fontSize.value;
        const position = settings.legendCard.position.value.value as string;
        const itemHeight = fontSize + 6;
        const totalHeight = viewModel.series.length * itemHeight;

        let startX: number;
        let startY: number;

        switch (position) {
            case "top":
                startX = chartArea.left + chartArea.width / 2 - 60;
                startY = 10;
                break;
            case "bottom":
                startX = chartArea.left + chartArea.width / 2 - 60;
                startY = chartArea.top + chartArea.height + 10;
                break;
            case "left":
                startX = 5;
                startY = chartArea.top + chartArea.height / 2 - totalHeight / 2;
                break;
            case "right":
                startX = chartArea.left + chartArea.width + 10;
                startY = chartArea.top + chartArea.height / 2 - totalHeight / 2;
                break;
            default:
                startX = chartArea.left + chartArea.width / 2 - 60;
                startY = chartArea.top + chartArea.height + 10;
        }

        viewModel.series.forEach((s, i) => {
            const y = startY + i * itemHeight;
            legendGroup.append("rect")
                .attr("x", startX)
                .attr("y", y)
                .attr("width", 12)
                .attr("height", 12)
                .attr("rx", 2)
                .attr("fill", s.color);

            legendGroup.append("text")
                .attr("x", startX + 18)
                .attr("y", y + 10)
                .attr("fill", "#333")
                .attr("font-size", fontSize + "px")
                .text(s.name);
        });
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
