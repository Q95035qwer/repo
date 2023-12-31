import { AddRowModalHandlerResponse } from "cdm/ModalsModel";
import { t } from "lang/helpers";
import { Setting } from "obsidian";
import { AbstractHandlerClass } from "patterns/chain/AbstractHandler";
import { StringSuggest } from "settings/suggesters/StringSuggester";

export class TemplateDropdownHandler extends AbstractHandlerClass<AddRowModalHandlerResponse> {
    settingTitle: string = t("add_row_modal_template_dropdown_title");
    handle(
        response: AddRowModalHandlerResponse
    ): AddRowModalHandlerResponse {
        const { containerEl, addRowModalManager } = response;
        const { rowTemplate, configState } = addRowModalManager.modal.state;

        const avaliableOptions: Record<string, string> = {};
        rowTemplate.options.forEach((option) => {
            avaliableOptions[option.label] = option.value;
        });

        const updateTemplatHandler = async (value: string): Promise<void> => {
            rowTemplate.update(value);
            configState.actions.alterConfig({
                current_row_template: value,
            });
        }

        new Setting(containerEl)
            .setName(this.settingTitle)
            .setDesc(t('add_row_modal_template_dropdown_desc'))
            .addSearch((cb) => {
                new StringSuggest(
                    cb.inputEl,
                    avaliableOptions
                );
                cb.setPlaceholder(t("add_row_modal_template_dropdown_placeholder"))
                    .setValue(rowTemplate.template)
                    .onChange(updateTemplatHandler);

                cb.inputEl.style.width = "auto";
            });

        return this.goNext(response);
    }
}
