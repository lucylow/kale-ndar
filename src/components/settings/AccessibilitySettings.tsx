import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Eye, 
  Keyboard, 
  Volume2, 
  Accessibility, 
  Type, 
  Contrast,
  RotateCcw
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/hooks/use-toast';

const AccessibilitySettings = () => {
  const { settings, updateSettings, resetSettings, announceToScreenReader } = useAccessibility();
  const { currentLanguage, supportedLanguages, setLanguage, t } = useI18n();
  const { toast } = useToast();
  const [isTestingScreenReader, setIsTestingScreenReader] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    announceToScreenReader(`${key} setting changed to ${value}`);
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const testScreenReader = () => {
    setIsTestingScreenReader(true);
    announceToScreenReader("Screen reader test: This is a test announcement for accessibility.", "assertive");
    toast({
      title: "Screen Reader Test",
      description: "Test announcement sent to screen readers.",
    });
    setTimeout(() => setIsTestingScreenReader(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Accessibility className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Accessibility Settings</h2>
      </div>

      <div className="grid gap-6">
        {/* Visual Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increases contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="font-size">Font Size</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust text size for better readability
                </p>
              </div>
              <Select
                value={settings.fontSize}
                onValueChange={(value) => handleSettingChange('fontSize', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="color-blind">Color Blind Support</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust colors for color vision deficiency
                </p>
              </div>
              <Select
                value={settings.colorBlindMode}
                onValueChange={(value) => handleSettingChange('colorBlindMode', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Motion & Animation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Motion & Animation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion">Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimizes animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard & Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard & Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                <p className="text-sm text-muted-foreground">
                  Improved focus indicators and keyboard shortcuts
                </p>
              </div>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="focus-visible">Focus Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Show clear focus outlines for keyboard users
                </p>
              </div>
              <Switch
                id="focus-visible"
                checked={settings.focusVisible}
                onCheckedChange={(checked) => handleSettingChange('focusVisible', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Screen Reader */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Screen Reader Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="screen-reader">Enhanced Screen Reader Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Optimizes content for screen readers
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
              />
            </div>

            <Separator />

            <div>
              <Label>Screen Reader Test</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Test if your screen reader is working properly
              </p>
              <Button
                onClick={testScreenReader}
                disabled={isTestingScreenReader}
                variant="outline"
                className="w-full"
              >
                {isTestingScreenReader ? 'Testing...' : 'Test Screen Reader'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Language & Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Interface Language</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Choose your preferred language for the interface
              </p>
              <Select value={currentLanguage.code} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {lang.name}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Reset Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Reset All Accessibility Settings</Label>
                <p className="text-sm text-muted-foreground">
                  This will restore all accessibility settings to their defaults
                </p>
              </div>
              <Button
                onClick={() => {
                  resetSettings();
                  toast({
                    title: "Settings Reset",
                    description: "All accessibility settings have been reset to defaults.",
                  });
                }}
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
              >
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilitySettings;