import { App, PluginSettingTab, Setting } from "obsidian";

import type DayPlanner from "./main";
import { DayPlannerMode } from "./settings";
import { ICONS } from "./constants";
import MomentDateRegex from "./moment-date-regex";

export class DayPlannerSettingsTab extends PluginSettingTab {
  momentDateRegex: MomentDateRegex;
  plugin: DayPlanner;
  constructor(app: App, plugin: DayPlanner) {
    super(app, plugin);
    this.plugin = plugin;
    this.momentDateRegex = new MomentDateRegex(plugin.settings);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Day Planner Mode")
      .setDesc(this.modeDescriptionContent())
      .addDropdown((dropDown) =>
        dropDown
          .addOption(DayPlannerMode[DayPlannerMode.File], "File mode")
          .addOption(DayPlannerMode[DayPlannerMode.Command], "Command mode")
          .setValue(DayPlannerMode[this.plugin.settings.mode] || DayPlannerMode.File.toString())
          .onChange((value: string) => {
            this.plugin.settings.mode = DayPlannerMode[value as keyof typeof DayPlannerMode];
            this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Complete past planner items")
      .setDesc("The plugin will automatically mark checkboxes for tasks and breaks in the past as complete")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.completePastItems).onChange((value: boolean) => {
          this.plugin.settings.completePastItems = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Mermaid Gantt")
      .setDesc("Include a mermaid gantt chart generated for the day planner")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.mermaid).onChange((value: boolean) => {
          this.plugin.settings.mermaid = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Status Bar - Circular Progress")
      .setDesc("Display a circular progress bar in the status bar")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.circularProgress).onChange((value: boolean) => {
          this.plugin.settings.circularProgress = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Status Bar - Now and Next")
      .setDesc("Display now and next tasks in the status bar")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.nowAndNextInStatusBar).onChange((value: boolean) => {
          this.plugin.settings.nowAndNextInStatusBar = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Task Notification")
      .setDesc("Display a notification when a new task is started")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showTaskNotification).onChange((value: boolean) => {
          this.plugin.settings.showTaskNotification = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Timeline Zoom Level")
      .setDesc("The zoom level to display the timeline. The higher the number, the more vertical space each task will take up.")
      .addSlider((slider) =>
        slider
          .setLimits(1, 5, 1)
          .setValue(this.plugin.settings.timelineZoomLevel ?? 4)
          .setDynamicTooltip()
          .onChange((value: number) => {
            this.plugin.settings.timelineZoomLevel = value;
            this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Timeline Icon")
      .setDesc("The icon of the timeline pane. Reopen timeline pane or restart obsidian to see the change.")
      .addDropdown((dropdown) => {
        ICONS.forEach((icon) => dropdown.addOption(icon, icon));
        return dropdown.setValue(this.plugin.settings.timelineIcon ?? "calendar-with-checkmark").onChange((value: string) => {
          this.plugin.settings.timelineIcon = value;
          this.plugin.saveData(this.plugin.settings);
        });
      });

    new Setting(containerEl)
      .setName("BREAK task label")
      .setDesc("Use this label to mark break between tasks.")
      .addText((component) =>
        component.setValue(this.plugin.settings.breakLabel ?? "BREAK").onChange((value: string) => {
          this.plugin.settings.breakLabel = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("END task label")
      .setDesc("Use this label to mark the end of all tasks.")
      .addText((component) =>
        component.setValue(this.plugin.settings.endLabel ?? "END").onChange((value: string) => {
          this.plugin.settings.endLabel = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Automatically Create New Files")
      .setDesc("If Day Planner should create new files for days automatically (disable if in use with daily notes)")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.createFile).onChange((value: boolean) => {
          this.plugin.settings.createFile = value;
          this.plugin.saveData(this.plugin.settings);
        })
      );

    new Setting(containerEl)
      .setName("Folder Path")
      .setDesc("Set the folder path in which Day Planner should automatically look for files. (only in file mode)")
      .addText((text) =>
        text
          .setPlaceholder("Day Planners")
          .setValue(this.plugin.settings.customFolder)
          .onChange((value: string) => {
            this.plugin.settings.customFolder = value;
            this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Date Format")
      .setDesc("Set the Date Format in the File Name")
      .addText((text) =>
        text
          .setPlaceholder("YYYYMMDD")
          .setValue(this.plugin.settings.fileFormat)
          .onChange((value: string) => {
            this.plugin.settings.fileFormat = value;
            this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Filename Format")
      .setDesc("Set the file name format with {{date}} as date replacement.")
      .addText((text) =>
        text
          .setPlaceholder("Day Planner-{{date}}.md")
          .setValue(this.plugin.settings.fileName)
          .onChange((value: string) => {
            this.plugin.settings.fileName = value;
            this.plugin.saveData(this.plugin.settings);
          })
      );
  }

  private modeDescriptionContent(): DocumentFragment {
    const descEl = document.createDocumentFragment();
    descEl.appendText("Choose between 2 modes to use the Day Planner plugin:");
    descEl.appendChild(document.createElement("br"));
    descEl.appendChild(document.createElement("strong")).appendText("File mode");
    descEl.appendChild(document.createElement("br"));
    descEl.appendText("Plugin automatically generates day planner notes for each day within a Day Planners folder.");
    descEl.appendChild(document.createElement("br"));
    descEl.appendChild(document.createElement("strong")).appendText("Command mode");
    descEl.appendChild(document.createElement("br"));
    descEl.appendText("Command used to insert a Day Planner for today within the current note.");
    descEl.appendChild(document.createElement("br"));
    this.addDocsLink(descEl);
    return descEl;
  }

  private addDocsLink(descEl: DocumentFragment) {
    const a = document.createElement("a");
    a.href = "https://github.com/lynchjames/obsidian-day-planner/blob/main/README.md";
    a.text = "plugin README";
    a.target = "_blank";
    descEl.appendChild(a);
    descEl.appendChild(document.createElement("br"));
  }
}
