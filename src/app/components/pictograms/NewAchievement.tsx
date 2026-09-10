import darkImage from "figma:asset/4f15738418b29d2e3a89d0ed83675e316a9fefee.png";
import lightImage from "figma:asset/1553838075ba0a7bace3c740d4bd9543a40201e7.png";
import { usePreferences } from "../../contexts/PreferencesContext";

interface PictogramProps {
  className?: string;
}

export function NewAchievementPictogram({ 
  className = "w-16 h-16"
}: PictogramProps) {
  const { theme } = usePreferences();
  
  const imageSrc = theme === 'dark' ? darkImage : lightImage;
  
  return (
    <img 
      src={imageSrc} 
      alt="New Achievement" 
      className={className}
    />
  );
}