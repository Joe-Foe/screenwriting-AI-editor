export interface LayoutRequirements {
  splitScreen: {
    leftPane: 'AI Chat Interface';
    rightPane: 'Screenplay Text Editor';
    divider: 'Draggable';
    resizable: boolean;
    minWidth: boolean;
  };
}

export interface ChatPaneRequirements {
  modelSelection: {
    dropdown: boolean;
    capabilities: boolean;
    defaultModel: string; // TBD
  };
  modes: {
    general: boolean;
    edit: {
      enabled: boolean; // Version 2 feature
      confirmationPrompts: boolean;
    };
  };
  organization: {
    tabs: boolean;
    persistentHistory: boolean;
  };
  messageDisplay: {
    styling: {
      userVsAI: boolean;
      timestamps: boolean;
      statusIndicators: boolean;
    };
    actions: {
      copy: boolean;
      share: boolean;
    };
  };
}

export interface ScreenplayFormatRules {
  character: {
    case: 'UPPERCASE';
    alignment: 'CENTER';
    margins: {
      left: '3 inches';
      right: '2.5 inches';
    };
    autoSuggest: boolean;
  };
  dialogue: {
    case: 'Normal';
    alignment: 'CENTER';
    position: 'Below Character';
  };
  sceneHeading: {
    case: 'UPPERCASE';
    alignment: 'LEFT';
    prefix: 'INT./EXT.';
  };
  action: {
    case: 'Normal';
    alignment: 'LEFT';
    spacing: 'SINGLE';
  };
  parenthetical: {
    case: 'Normal';
    margins: 'INDENTED';
    width: 'NARROW';
  };
}

export interface TechnicalRequirements {
  formatStorage: {
    blockData: {
      formatType: string;
      originalText: string;
      formatting: {
        margins: string;
        alignment: string;
      };
      position: number;
    };
  };
  performance: {
    updateSpeed: '< 100ms';
    largeDocumentHandling: boolean;
    responsiveTyping: boolean;
  };
}

export interface ImplementationDetails {
  editor: {
    recommendedLibraries: string[];
    markupFormat: 'Fountain';
    features: {
      undoRedo: boolean;
      realTimeFormatting: boolean;
      customStyles: boolean;
    };
  };
}

export interface ProjectRequirements {
  layout: LayoutRequirements;
  chatPane: ChatPaneRequirements;
  formatRules: ScreenplayFormatRules;
  technical: TechnicalRequirements;
  implementation: ImplementationDetails;
} 