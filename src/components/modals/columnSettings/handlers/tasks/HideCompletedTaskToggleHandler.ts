import { add_toggle } from "settings/SettingsComponents";
import { ColumnSettingsHandlerResponse } from "cdm/ModalsModel";
import { AbstractHandlerClass } from "patterns/chain/AbstractHandler";
import { t } from "lang/helpers";
export class HideCompletedTaskToggleHandler extends AbstractHandlerClass<ColumnSettingsHandlerResponse> {
    settingTitle = t("column_settings_modal_hide_completed_tasks_toggle_title");
    handle(columnHandlerResponse: ColumnSettingsHandlerResponse): ColumnSettingsHandlerResponse {
        const { column, containerEl, columnSettingsManager } = columnHandlerResponse;
        const { view } = columnSettingsManager.modal;
        const inline_togle_promise = async (value: boolean): Promise<void> => {
            column.config.task_hide_completed = value;
            // Persist value
            await view.diskConfig.updateColumnConfig(column.id, {
                task_hide_completed: value
            });
            columnSettingsManager.modal.enableReset = true;
        }
        add_toggle(
            containerEl,
            this.settingTitle,
            t("column_settings_modal_hide_completed_tasks_toggle_desc"),
            column.config.task_hide_completed,
            inline_togle_promise
        );
        return this.goNext(columnHandlerResponse);
    }
}