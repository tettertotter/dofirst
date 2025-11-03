/**
 * Design System Showcase
 *
 * 21 premium components. Zero compromises. Every detail perfect.
 */

'use client';

import React, { useState } from 'react';
import {
  ThemeProvider,
  ToastProvider,
  useToast,
  Button,
  Input,
  Textarea,
  Toggle,
  Checkbox,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  ModalFooter,
  Avatar,
  AvatarGroup,
  Spinner,
  Tooltip,
  Alert,
  LinearProgress,
  CircularProgress,
  Skeleton,
  SkeletonGroup,
  Divider,
  Select,
  Radio,
  RadioGroup,
  Tabs,
  TabPanel,
  Accordion,
  Menu,
  useTheme,
  useColorScheme,
  spacing,
  colors,
} from '@todaypool/design-system';

function DemoContent() {
  const { theme, resolvedColors } = useTheme();
  const { toggleColorScheme, isDark } = useColorScheme();
  const { showToast } = useToast();

  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [progress, setProgress] = useState(45);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [countryValue, setCountryValue] = useState('');
  const [priorityValue, setPriorityValue] = useState('');
  const [radioValue, setRadioValue] = useState('option1');
  const [activeTab, setActiveTab] = useState('overview');
  const [accordionValue, setAccordionValue] = useState<string[]>(['item1']);

  const handleToastDemo = (variant: 'success' | 'error' | 'warning' | 'info') => {
    showToast({
      message: {
        success: 'Changes saved successfully!',
        error: 'Failed to save. Please try again.',
        warning: 'Unsaved changes will be lost.',
        info: 'Pro tip: Use Cmd+K for quick actions.',
      }[variant],
      variant,
      duration: 4000,
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: resolvedColors.bg.primary,
        color: resolvedColors.text.primary,
        padding: `${spacing['2xl']} ${spacing.xl}`,
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Hero Header */}
        <div style={{ marginBottom: spacing['3xl'] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl }}>
            <div>
              <Badge variant="primary" style={{ marginBottom: spacing.md }}>
                21 Components
              </Badge>
              <h1 style={{ fontSize: theme.typography.sizes['5xl'].fontSize, fontWeight: theme.typography.weights.bold, margin: 0, marginBottom: spacing.md }}>
                Design System
              </h1>
              <p style={{ fontSize: theme.typography.sizes.xl.fontSize, color: resolvedColors.text.secondary, margin: 0, maxWidth: '600px' }}>
                Professional components with zero compromises. Every detail polished for that "wow" feeling.
              </p>
            </div>
            <Button onClick={toggleColorScheme} size="lg">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.lg, marginTop: spacing.xl }}>
            {[
              { label: 'Components', value: '21' },
              { label: 'Utility Hooks', value: '10' },
              { label: 'Variants', value: '70+' },
              { label: 'Quality', value: '100%' },
            ].map((stat) => (
              <Card key={stat.label} variant="outlined" padding="md">
                <div style={{ fontSize: theme.typography.sizes['3xl'].fontSize, fontWeight: theme.typography.weights.bold, marginBottom: spacing.xs }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['2xl'] }}>
          {/* Feedback Components */}
          {showAlert && (
            <Alert
              variant="info"
              title="Welcome to the Design System"
              dismissible
              onDismiss={() => setShowAlert(false)}
              action={{ label: 'Learn More', onClick: () => showToast({ message: 'Opening documentation...', variant: 'info' }) }}
            >
              Explore 16 premium components built with attention to every detail. Try the theme toggle, open modals, and trigger toasts.
            </Alert>
          )}

          {/* Buttons & Actions */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Buttons & Actions"
              description="Professional buttons with all states and smooth animations"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                <div>
                  <h4 style={{ marginBottom: spacing.md, fontSize: theme.typography.sizes.base.fontSize }}>Variants</h4>
                  <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
                      {loading ? 'Loading...' : 'With Loading'}
                    </Button>
                    <Button disabled>Disabled</Button>
                    <Tooltip content="Opens a modal dialog" position="top">
                      <Button onClick={() => setModalOpen(true)}>With Tooltip</Button>
                    </Tooltip>
                  </div>
                </div>

                <Divider label="Sizes" />

                <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Controls */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Form Controls"
              description="Inputs, textareas, toggles, and checkboxes with perfect validation states"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                {/* Text inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <Input
                      label="Email Address"
                      placeholder="you@example.com"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      helperText="We'll never share your email"
                    />
                    <Input
                      label="Search"
                      placeholder="Type to search..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      clearable
                      onClear={() => setInputValue('')}
                    />
                    <Input
                      label="Required Field"
                      placeholder="Must not be empty"
                      error
                      errorMessage="This field is required"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <Textarea
                      label="Description"
                      placeholder="Tell us more..."
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                      maxLength={200}
                      showCount
                      helperText="Auto-resizes as you type"
                    />
                    <Toggle
                      label="Email notifications"
                      helperText="Receive updates about your account"
                      checked={toggleChecked}
                      onChange={setToggleChecked}
                    />
                    <Checkbox
                      label="Accept terms and conditions"
                      helperText="Required to continue"
                      checked={checkboxChecked}
                      onChange={setCheckboxChecked}
                    />
                  </div>
                </div>

                <Divider label="Select & Radio" />

                {/* Select and Radio */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.xl }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <Select
                      label="Country"
                      placeholder="Select a country..."
                      value={countryValue}
                      onChange={setCountryValue}
                      searchable
                      clearable
                      options={[
                        { value: 'us', label: 'United States', icon: '🇺🇸' },
                        { value: 'uk', label: 'United Kingdom', icon: '🇬🇧' },
                        { value: 'ca', label: 'Canada', icon: '🇨🇦' },
                        { value: 'au', label: 'Australia', icon: '🇦🇺' },
                        { value: 'de', label: 'Germany', icon: '🇩🇪' },
                        { value: 'fr', label: 'France', icon: '🇫🇷' },
                        { value: 'jp', label: 'Japan', icon: '🇯🇵' },
                      ]}
                      helperText="Searchable dropdown with icons"
                    />
                    <Select
                      label="Priority"
                      value={priorityValue}
                      onChange={setPriorityValue}
                      options={[
                        { value: 'low', label: 'Low Priority' },
                        { value: 'medium', label: 'Medium Priority' },
                        { value: 'high', label: 'High Priority' },
                        { value: 'urgent', label: 'Urgent', disabled: true },
                      ]}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <div>
                      <label style={{ fontSize: theme.typography.sizes.sm.fontSize, fontWeight: theme.typography.weights.medium, color: resolvedColors.text.primary, marginBottom: spacing.xs, display: 'block' }}>
                        Notification Preference
                      </label>
                      <RadioGroup
                        name="notifications"
                        value={radioValue}
                        onChange={setRadioValue}
                        options={[
                          { value: 'option1', label: 'All notifications', helperText: 'Get notified about everything' },
                          { value: 'option2', label: 'Important only', helperText: 'Only critical updates' },
                          { value: 'option3', label: 'None', helperText: 'No notifications' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback & Loading */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Feedback & Loading States"
              description="Toasts, alerts, progress bars, and skeleton loaders"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Toast Notifications</h4>
                  <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                    <Button onClick={() => handleToastDemo('success')} variant="secondary">Success</Button>
                    <Button onClick={() => handleToastDemo('error')} variant="secondary">Error</Button>
                    <Button onClick={() => handleToastDemo('warning')} variant="secondary">Warning</Button>
                    <Button onClick={() => handleToastDemo('info')} variant="secondary">Info</Button>
                  </div>
                </div>

                <Divider />

                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Progress Indicators</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <span style={{ fontSize: theme.typography.sizes.sm.fontSize }}>Upload Progress</span>
                        <span style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>{progress}%</span>
                      </div>
                      <LinearProgress value={progress} variant="primary" />
                      <div style={{ display: 'flex', gap: spacing.xs, marginTop: spacing.sm }}>
                        <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
                        <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: spacing.xl, alignItems: 'center' }}>
                      <CircularProgress value={progress} variant="primary" size="lg" showLabel />
                      <CircularProgress value={75} variant="success" size="md" showLabel />
                      <CircularProgress variant="primary" size="sm" />
                      <Spinner size="md" />
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <h4 style={{ margin: 0 }}>Skeleton Loaders</h4>
                    <Button size="sm" onClick={() => setShowSkeleton(!showSkeleton)}>
                      {showSkeleton ? 'Show Content' : 'Show Skeleton'}
                    </Button>
                  </div>
                  {showSkeleton ? (
                    <div style={{ display: 'flex', gap: spacing.md }}>
                      <Skeleton variant="circular" width="48px" height="48px" />
                      <div style={{ flex: 1 }}>
                        <Skeleton variant="text" height="20px" style={{ marginBottom: spacing.xs }} />
                        <SkeletonGroup lines={2} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: spacing.md }}>
                      <Avatar name="Sarah Chen" size="lg" status="online" />
                      <div>
                        <div style={{ fontWeight: theme.typography.weights.semibold, marginBottom: spacing.xs }}>Sarah Chen</div>
                        <div style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>
                          Senior Designer at Acme Corp. Passionate about creating beautiful, accessible interfaces.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Components */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Display Components"
              description="Avatars, badges, cards, and dividers for content organization"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Avatars with Status</h4>
                  <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center', marginBottom: spacing.lg }}>
                    <Avatar name="Alice Johnson" size="sm" status="online" />
                    <Avatar name="Bob Smith" size="md" status="away" />
                    <Avatar name="Carol White" size="lg" status="busy" />
                    <Avatar name="David Brown" size="xl" status="offline" />
                  </div>
                  <div>
                    <span style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary, marginRight: spacing.sm }}>
                      Team (6 members):
                    </span>
                    <AvatarGroup max={4} size="md">
                      <Avatar name="Alice Johnson" />
                      <Avatar name="Bob Smith" />
                      <Avatar name="Carol White" />
                      <Avatar name="David Brown" />
                      <Avatar name="Eve Davis" />
                      <Avatar name="Frank Miller" />
                    </AvatarGroup>
                  </div>
                </div>

                <Divider />

                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Badges & Status</h4>
                  <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="primary" shape="pill">Pill Shape</Badge>
                    <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
                      <Badge dot variant="success" />
                      <span style={{ fontSize: theme.typography.sizes.sm.fontSize }}>Online</span>
                    </div>
                  </div>
                </div>

                <Divider label="Card Variants" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.md }}>
                  <Card variant="default" padding="md">
                    <div style={{ fontWeight: theme.typography.weights.semibold, marginBottom: spacing.xs }}>Default</div>
                    <div style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>
                      No border or shadow
                    </div>
                  </Card>
                  <Card variant="outlined" padding="md">
                    <div style={{ fontWeight: theme.typography.weights.semibold, marginBottom: spacing.xs }}>Outlined</div>
                    <div style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>
                      With border
                    </div>
                  </Card>
                  <Card variant="elevated" padding="md">
                    <div style={{ fontWeight: theme.typography.weights.semibold, marginBottom: spacing.xs }}>Elevated</div>
                    <div style={{ fontSize: theme.typography.sizes.sm.fontSize, color: resolvedColors.text.secondary }}>
                      With shadow
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation & Organization */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Navigation & Organization"
              description="Tabs, accordions, and menus for content organization"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                {/* Tabs */}
                <div>
                  <h4 style={{ marginBottom: spacing.md, fontSize: theme.typography.sizes.base.fontSize }}>Tabs with Animated Indicator</h4>
                  <Tabs
                    items={[
                      { value: 'overview', label: 'Overview', icon: '📊' },
                      { value: 'analytics', label: 'Analytics', icon: '📈' },
                      { value: 'settings', label: 'Settings', icon: '⚙️' },
                      { value: 'disabled', label: 'Disabled', disabled: true },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="line"
                  />
                  <TabPanel value="overview" activeValue={activeTab}>
                    <Card variant="outlined" padding="md" style={{ marginTop: spacing.md }}>
                      <div style={{ fontSize: theme.typography.sizes.sm.fontSize }}>
                        <strong>Overview Panel</strong> - This is the overview content. The animated indicator smoothly slides between tabs.
                      </div>
                    </Card>
                  </TabPanel>
                  <TabPanel value="analytics" activeValue={activeTab}>
                    <Card variant="outlined" padding="md" style={{ marginTop: spacing.md }}>
                      <div style={{ fontSize: theme.typography.sizes.sm.fontSize }}>
                        <strong>Analytics Panel</strong> - View your metrics and insights here. Try using arrow keys for keyboard navigation!
                      </div>
                    </Card>
                  </TabPanel>
                  <TabPanel value="settings" activeValue={activeTab}>
                    <Card variant="outlined" padding="md" style={{ marginTop: spacing.md }}>
                      <div style={{ fontSize: theme.typography.sizes.sm.fontSize }}>
                        <strong>Settings Panel</strong> - Configure your preferences. Resize the window to see the indicator adjust!
                      </div>
                    </Card>
                  </TabPanel>

                  <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg, flexWrap: 'wrap' }}>
                    <Tabs
                      items={[
                        { value: 'tab1', label: 'Pill' },
                        { value: 'tab2', label: 'Variant' },
                        { value: 'tab3', label: 'Example' },
                      ]}
                      variant="pill"
                      size="sm"
                    />
                    <Tabs
                      items={[
                        { value: 'tab1', label: 'Enclosed' },
                        { value: 'tab2', label: 'Variant' },
                        { value: 'tab3', label: 'Example' },
                      ]}
                      variant="enclosed"
                      size="sm"
                    />
                  </div>
                </div>

                <Divider />

                {/* Accordion */}
                <div>
                  <h4 style={{ marginBottom: spacing.md, fontSize: theme.typography.sizes.base.fontSize }}>Accordion</h4>
                  <Accordion
                    items={[
                      {
                        value: 'item1',
                        title: 'How does the design system work?',
                        icon: '❓',
                        content: (
                          <div>
                            The design system is built with professional design tokens, a comprehensive theme system, and 21 premium components.
                            Every component is built with accessibility, dark mode, and smooth animations from the ground up.
                          </div>
                        ),
                      },
                      {
                        value: 'item2',
                        title: 'Can I customize the components?',
                        icon: '🎨',
                        content: (
                          <div>
                            Yes! All components accept custom styling through className and style props. The theme system allows you to
                            customize colors, spacing, typography, and more at a global level.
                          </div>
                        ),
                      },
                      {
                        value: 'item3',
                        title: 'Is dark mode supported?',
                        icon: '🌙',
                        content: (
                          <div>
                            Absolutely. Dark mode is built into every component from day one. The ThemeProvider automatically handles
                            color resolution, and you can toggle between light, dark, and auto modes.
                          </div>
                        ),
                      },
                    ]}
                    value={accordionValue}
                    onChange={setAccordionValue}
                    variant="outlined"
                    multiple
                  />
                </div>

                <Divider />

                {/* Menu */}
                <div>
                  <h4 style={{ marginBottom: spacing.md, fontSize: theme.typography.sizes.base.fontSize }}>Dropdown Menu</h4>
                  <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                    <Menu
                      trigger={<Button variant="secondary">Actions Menu</Button>}
                      items={[
                        { value: 'edit', label: 'Edit', icon: '✏️', shortcut: '⌘E', onClick: () => showToast({ message: 'Edit clicked', variant: 'info' }) },
                        { value: 'duplicate', label: 'Duplicate', icon: '📋', shortcut: '⌘D', onClick: () => showToast({ message: 'Duplicated', variant: 'success' }) },
                        { value: 'divider1', label: '', divider: true },
                        { value: 'share', label: 'Share', icon: '🔗', onClick: () => showToast({ message: 'Share link copied', variant: 'success' }) },
                        { value: 'export', label: 'Export', icon: '📥', disabled: true },
                        { value: 'divider2', label: '', divider: true },
                        { value: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', shortcut: '⌘⌫', onClick: () => showToast({ message: 'Deleted', variant: 'error' }) },
                      ]}
                    />

                    <Menu
                      trigger={<Button variant="ghost">More Options</Button>}
                      position="bottom-right"
                      items={[
                        { value: 'settings', label: 'Settings', icon: '⚙️' },
                        { value: 'help', label: 'Help & Support', icon: '❓' },
                        { value: 'divider', label: '', divider: true },
                        { value: 'logout', label: 'Logout', icon: '🚪', variant: 'danger' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color System */}
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Color System"
              description="Professional color scales with semantic meaning"
            />
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Primary Scale (50-900)</h4>
                  <div style={{ display: 'flex', gap: spacing[1], borderRadius: theme.radius.md, overflow: 'hidden' }}>
                    {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                      <div
                        key={shade}
                        style={{
                          flex: 1,
                          height: '60px',
                          backgroundColor: colors.primary[shade as keyof typeof colors.primary],
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          padding: spacing.xs,
                        }}
                      >
                        <span style={{ fontSize: theme.typography.sizes.xs.fontSize, color: shade > 400 ? '#fff' : '#000', fontWeight: theme.typography.weights.semibold }}>
                          {shade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: spacing.md }}>Semantic Colors</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.md }}>
                    {[
                      { label: 'Success', color: colors.accent[500] },
                      { label: 'Warning', color: colors.warning[500] },
                      { label: 'Error', color: colors.error[500] },
                      { label: 'Info', color: colors.info[500] },
                    ].map(({ label, color }) => (
                      <div
                        key={label}
                        style={{
                          height: '80px',
                          backgroundColor: color,
                          borderRadius: theme.radius.md,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: theme.typography.weights.semibold,
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md" title="Example Modal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <p style={{ margin: 0, color: resolvedColors.text.secondary }}>
            This modal features backdrop blur, focus trap, scroll locking, and smooth animations. Try pressing Escape or clicking outside to close.
          </p>
          <Input label="Full Name" placeholder="Enter your name" />
          <Textarea label="Comments" placeholder="Optional feedback..." rows={3} />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => { setModalOpen(false); showToast({ message: 'Changes saved!', variant: 'success' }); }}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function DesignSystemDemoPage() {
  return (
    <ThemeProvider config={{ colorScheme: 'auto', persistPreference: true }}>
      <ToastProvider position="top-right" maxToasts={3}>
        <DemoContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
