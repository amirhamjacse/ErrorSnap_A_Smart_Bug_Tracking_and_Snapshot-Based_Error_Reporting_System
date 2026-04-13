import IconWrapper, { IconWrapperProps } from "components/IconWrapper";
import ChromeIcon from "icons/ChromeIcon";
import EdgeIcon from "icons/EdgeIcon";
import FirefoxIcon from "icons/FirefoxIcon";
import Safari from "icons/Safari";

export function createIcon(icon: React.ElementType | string) {
  return (props: Omit<IconWrapperProps, "icon">) => (
    <IconWrapper {...props} icon={icon} />
  );
}

export const getBrowserIcon = (browser: string) => {
  const browserLower = browser.toLowerCase();
  if (browserLower.includes("chrome")) {
    return <ChromeIcon fontSize={15} />;
  } else if (browserLower.includes("edge")) {
    return <EdgeIcon fontSize={15} />;
  } else if (browserLower.includes("safari")) {
    return <Safari fontSize={15} />;
  } else if (browserLower.includes("firefox")) {
    return <FirefoxIcon fontSize={15} />;
  }
};
