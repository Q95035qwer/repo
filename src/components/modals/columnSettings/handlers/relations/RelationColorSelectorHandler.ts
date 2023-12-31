import { ColumnSettingsHandlerResponse } from "cdm/ModalsModel";
import { AbstractHandlerClass } from "patterns/chain/AbstractHandler";
import { Setting } from "obsidian";
import { t } from "lang/helpers";
import { Db } from "services/CoreService";

export class RelationColorSelectorHandler extends AbstractHandlerClass<ColumnSettingsHandlerResponse>  {
    settingTitle: string = t("column_settings_modal_relation_color_title");
    handle(columnHandlerResponse: ColumnSettingsHandlerResponse): ColumnSettingsHandlerResponse {
        const { column, containerEl, columnSettingsManager } = columnHandlerResponse;
        const { view } = columnSettingsManager.modal;

        new Setting(containerEl)
            .setName(this.settingTitle)
            .setDesc(t("column_settings_modal_relation_color_desc"))
            .addColorPicker((colorPicker) => {
                colorPicker
                    .setValueHsl(Db.coreFns.colors.stringtoHsl(column.config.relation_color))
                    .onChange(async () => {
                        const newColor = Db.coreFns.colors.hslToString(
                            colorPicker.getValueHsl()
                        );
                        await view.diskConfig.updateColumnConfig(column.id, {
                            relation_color: newColor,
                        });
                        columnSettingsManager.modal.enableReset = true;
                    });
            })
        return this.goNext(columnHandlerResponse);
    }
}