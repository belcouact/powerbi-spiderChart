import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private svg;
    private mainGroup;
    private host;
    private selectionManager;
    private formattingSettings;
    private formattingSettingsService;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private transformData;
    private clearSVG;
    private showNoDataMessage;
    private getViewport;
    private renderSpiderChart;
    private renderLegend;
    getFormattingModel(): powerbi.visuals.FormattingModel;
}
