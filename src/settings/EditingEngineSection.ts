import { AbstractChain } from "patterns/chain/AbstractFactoryChain";
import { SettingHandlerResponse } from "settings/handlers/AbstractSettingHandler";
import { add_setting_header } from "settings/SettingsComponents";
import { AbstractHandler } from "patterns/chain/AbstractHandler";
import { DateFormatHandler } from "settings/handlers/editingEngine/DateFormatHandler";
import { t } from "lang/helpers";

class EditingEngineSetttingsSection extends AbstractChain<SettingHandlerResponse> {
    protected customHandle(settingHandlerResponse: SettingHandlerResponse): SettingHandlerResponse {
        const developer_section = settingHandlerResponse.containerEl.createDiv("configuration-section-container-editor-engine");
        // title of the section
        add_setting_header(developer_section, t("settings_editing_engine_section"), 'h3');
        settingHandlerResponse.containerEl = developer_section;
        return settingHandlerResponse;
    }
    protected getHandlers(): AbstractHandler<SettingHandlerResponse>[] {
        return [
            new DateFormatHandler()
        ]
    }
}

const editing_engine_settings_section = new EditingEngineSetttingsSection();
export default editing_engine_settings_section;