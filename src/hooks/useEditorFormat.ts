import { useState } from 'react';

// Define our format types
export type ScreenplayFormatType = 
  | 'SCENE_HEADING' 
  | 'ACTION' 
  | 'CHARACTER' 
  | 'DIALOGUE' 
  | 'PARENTHETICAL';

// Hook to share format state between components
export function useEditorFormat() {
  const [activeFormat, setActiveFormat] = useState<ScreenplayFormatType>('ACTION');
  
  return {
    activeFormat,
    setFormat: (format: ScreenplayFormatType) => setActiveFormat(format),
  };
} 