'use client';

import React, { useState } from 'react';
import {
  // Hooks
  usePerformance,
  useBiometric,
  useHapticPatterns,
  useConnectionQuality,
  useWakeLock,
  useIntersectionObserver,
  useLazyLoad,
  useBatteryStatus,
  hapticPatterns,
  contextualHaptics,
  // Components
  OfflineQueueIndicator,
  PushPermissions,
  CameraUpload,
  Onboarding,
  RatingPrompt,
  GestureTutorial,
  Button,
  Card,
  Badge,
  Alert,
  Tabs,
  // Utils
  getFocusableElements,
  createFocusTrap,
  announce,
  // Types
  type QueuedAction,
} from '@todaypool/design-system';

export default function MobileUXTestPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        Mobile UX Features - Testing Dashboard
      </h1>

      <Tabs
        items={[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Performance' },
          { id: 'offline', label: 'Offline' },
          { id: 'auth', label: 'Auth' },
          { id: 'media', label: 'Media' },
          { id: 'tutorials', label: 'Tutorials' },
          { id: 'device', label: 'Device' },
          { id: 'accessibility', label: 'A11y' },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'offline' && <OfflineTab />}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'media' && <MediaTab />}
        {activeTab === 'tutorials' && <TutorialsTab />}
        {activeTab === 'device' && <DeviceTab />}
        {activeTab === 'accessibility' && <AccessibilityTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const performance = usePerformance();
  const connection = useConnectionQuality();
  const battery = useBatteryStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          System Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <StatusCard
            title="Connection"
            value={connection.quality}
            color={getQualityColor(connection.quality)}
            icon="📡"
          />
          <StatusCard
            title="Battery"
            value={battery.level ? `${Math.round(battery.level * 100)}%` : 'N/A'}
            color={battery.isCharging ? '#10b981' : getBatteryColor(battery.level)}
            icon={battery.isCharging ? '🔌' : '🔋'}
          />
          <StatusCard
            title="Performance"
            value={performance.metrics.lcp ? `${Math.round(performance.metrics.lcp.value)}ms` : 'Loading...'}
            color={performance.metrics.lcp ? getRatingColor(performance.metrics.lcp.rating) : '#6b7280'}
            icon="⚡"
          />
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Features Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <FeatureBadge name="Performance Monitoring" status="active" />
          <FeatureBadge name="Offline Queue" status="active" />
          <FeatureBadge name="Biometric Auth" status="ready" />
          <FeatureBadge name="Push Notifications" status="ready" />
          <FeatureBadge name="Camera Upload" status="active" />
          <FeatureBadge name="Onboarding" status="active" />
          <FeatureBadge name="Rating Prompt" status="active" />
          <FeatureBadge name="Haptic Patterns" status="active" />
          <FeatureBadge name="Gesture Tutorial" status="active" />
          <FeatureBadge name="Connection Monitor" status="active" />
          <FeatureBadge name="Wake Lock" status="ready" />
          <FeatureBadge name="Intersection Observer" status="active" />
          <FeatureBadge name="Focus Management" status="active" />
          <FeatureBadge name="Battery Status" status="active" />
        </div>
      </Card>
    </div>
  );
}

function PerformanceTab() {
  const { metrics, mark, measure } = usePerformance({
    onMetric: (metric) => {
      console.log('Performance metric:', metric);
    },
  });

  const testCustomTiming = () => {
    mark('test-start');
    setTimeout(() => {
      mark('test-end');
      const duration = measure('test-duration', 'test-start', 'test-end');
      alert(`Custom timing: ${duration}ms`);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Core Web Vitals
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <MetricCard title="LCP" metric={metrics.lcp} />
          <MetricCard title="FID" metric={metrics.fid} />
          <MetricCard title="CLS" metric={metrics.cls} />
          <MetricCard title="FCP" metric={metrics.fcp} />
          <MetricCard title="TTFB" metric={metrics.ttfb} />
          <MetricCard title="INP" metric={metrics.inp} />
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Custom Performance Timing
        </h2>
        <Button onClick={testCustomTiming}>Test Custom Timing (1s)</Button>
      </Card>
    </div>
  );
}

function OfflineTab() {
  const [queue, setQueue] = useState<QueuedAction[]>([
    { id: '1', type: 'create', description: 'Create new proposal', timestamp: Date.now() - 5000 },
    { id: '2', type: 'vote', description: 'Vote on "Weekend Plans"', timestamp: Date.now() - 3000 },
    { id: '3', type: 'update', description: 'Update profile', timestamp: Date.now() - 1000 },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setQueue([]);
      setIsSyncing(false);
      alert('All items synced!');
    }, 2000);
  };

  const handleClear = () => {
    setQueue([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Offline Queue Indicator
        </h2>
        <Alert variant="info" style={{ marginBottom: '16px' }}>
          The queue indicator appears in the bottom-right when there are pending actions.
        </Alert>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={() => setQueue([...queue, {
            id: String(Date.now()),
            type: 'action',
            description: 'New action added',
            timestamp: Date.now()
          }])}>
            Add to Queue
          </Button>
          <Button variant="outline" onClick={() => setQueue([])}>
            Clear Queue
          </Button>
        </div>
      </Card>

      <OfflineQueueIndicator
        queue={queue}
        isSyncing={isSyncing}
        onRetry={handleRetry}
        onClear={handleClear}
      />
    </div>
  );
}

function AuthTab() {
  const biometric = useBiometric({
    onRegister: (credential) => {
      console.log('Biometric registered:', credential);
      alert('Biometric authentication registered successfully!');
    },
    onAuthenticate: (credential) => {
      console.log('Biometric authenticated:', credential);
      alert('Biometric authentication successful!');
    },
    onError: (error) => {
      console.error('Biometric error:', error);
      alert(`Biometric error: ${error.message}`);
    },
  });

  const [showPushPermissions, setShowPushPermissions] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Biometric Authentication
        </h2>
        <Alert variant={biometric.isAvailable ? 'success' : 'warning'} style={{ marginBottom: '16px' }}>
          {biometric.isAvailable
            ? 'Biometric authentication is available on this device'
            : 'Biometric authentication is not available'}
        </Alert>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            onClick={biometric.register}
            isLoading={biometric.isLoading}
            disabled={!biometric.isAvailable}
          >
            Register Biometric
          </Button>
          <Button
            onClick={() => biometric.authenticate()}
            isLoading={biometric.isLoading}
            disabled={!biometric.isAvailable}
            variant="outline"
          >
            Authenticate
          </Button>
        </div>
        {biometric.error && (
          <Alert variant="error" style={{ marginTop: '16px' }}>
            {biometric.error.message}
          </Alert>
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Push Notifications
        </h2>
        <Button onClick={() => setShowPushPermissions(true)}>
          Request Push Permissions
        </Button>
      </Card>

      {showPushPermissions && (
        <PushPermissions
          isOpen={showPushPermissions}
          onComplete={() => {
            setShowPushPermissions(false);
            alert('Push permissions granted!');
          }}
          onSkip={() => setShowPushPermissions(false)}
          modal
        />
      )}
    </div>
  );
}

function MediaTab() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Camera Upload
        </h2>
        <CameraUpload
          onCapture={(file, preview) => {
            console.log('Image captured:', file);
            setCapturedImage(preview);
          }}
        />
        {capturedImage && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Captured Image:</p>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function TutorialsTab() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showGestureTutorial, setShowGestureTutorial] = useState(false);

  const haptics = useHapticPatterns();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Onboarding Flow
        </h2>
        <Button onClick={() => setShowOnboarding(true)}>
          Launch Onboarding
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Rating Prompt
        </h2>
        <Button onClick={() => setShowRating(true)}>
          Show Rating Prompt
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Gesture Tutorial
        </h2>
        <Button onClick={() => setShowGestureTutorial(true)}>
          Show Gesture Tutorial
        </Button>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Haptic Patterns
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <Button onClick={() => haptics.levelUp()}>Level Up</Button>
          <Button onClick={() => haptics.celebrate()}>Celebrate</Button>
          <Button onClick={() => haptics.refresh()}>Refresh</Button>
          <Button onClick={() => haptics.send()}>Send</Button>
          <Button onClick={() => haptics.delete()}>Delete</Button>
          <Button onClick={() => haptics.urgency()}>Urgency</Button>
          <Button onClick={() => contextualHaptics.buttonTap()}>Button Tap</Button>
          <Button onClick={() => contextualHaptics.toggleOn()}>Toggle On</Button>
        </div>
      </Card>

      {showOnboarding && (
        <Onboarding
          isOpen={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
            alert('Onboarding completed!');
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {showRating && (
        <RatingPrompt
          isOpen={showRating}
          onRate={(rating) => console.log('Rated:', rating)}
          onDismiss={() => setShowRating(false)}
        />
      )}

      {showGestureTutorial && (
        <GestureTutorial
          isOpen={showGestureTutorial}
          onComplete={() => {
            setShowGestureTutorial(false);
            alert('Gesture tutorial completed!');
          }}
          onSkip={() => setShowGestureTutorial(false)}
        />
      )}
    </div>
  );
}

function DeviceTab() {
  const connection = useConnectionQuality();
  const wakeLock = useWakeLock();
  const battery = useBatteryStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Connection Quality
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Quality:</strong> <Badge variant={connection.isOnline ? 'success' : 'error'}>{connection.quality}</Badge>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Type:</strong> {connection.effectiveType}
          </div>
          {connection.downlink && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Downlink:</strong> {connection.downlink} Mbps
            </div>
          )}
          {connection.rtt && (
            <div style={{ marginBottom: '8px' }}>
              <strong>RTT:</strong> {connection.rtt}ms
            </div>
          )}
          <div>
            <strong>Can Load Media:</strong> {connection.canLoadMedia ? '✅' : '❌'}
          </div>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Screen Wake Lock
        </h2>
        <Alert variant={wakeLock.isSupported ? 'success' : 'warning'} style={{ marginBottom: '16px' }}>
          {wakeLock.isSupported
            ? 'Wake Lock is supported on this device'
            : 'Wake Lock is not supported'}
        </Alert>
        <div style={{ marginBottom: '16px' }}>
          <strong>Status:</strong> <Badge variant={wakeLock.isActive ? 'success' : 'default'}>
            {wakeLock.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            onClick={wakeLock.request}
            disabled={!wakeLock.isSupported || wakeLock.isActive}
          >
            Activate Wake Lock
          </Button>
          <Button
            onClick={wakeLock.release}
            variant="outline"
            disabled={!wakeLock.isActive}
          >
            Release Wake Lock
          </Button>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Battery Status
        </h2>
        <Alert variant={battery.isSupported ? 'success' : 'warning'} style={{ marginBottom: '16px' }}>
          {battery.isSupported
            ? 'Battery Status API is supported'
            : 'Battery Status API is not supported'}
        </Alert>
        {battery.level !== null && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Level:</strong> {Math.round(battery.level * 100)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Charging:</strong> {battery.isCharging ? '🔌 Yes' : '🔋 No'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Category:</strong> <Badge variant={getBatteryBadgeVariant(battery.levelCategory)}>
                {battery.levelCategory}
              </Badge>
            </div>
            {battery.shouldSavePower && (
              <Alert variant="warning">
                Low battery - consider enabling power save mode
              </Alert>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function AccessibilityTab() {
  const { ref: lazyRef, shouldLoad } = useLazyLoad();
  const { ref: scrollRef, isVisible } = useScrollAnimation();

  const testFocusTrap = () => {
    const container = document.getElementById('focus-trap-demo');
    if (container) {
      const cleanup = createFocusTrap(container as HTMLElement);
      alert('Focus is now trapped in the demo area. Press Tab to see. Click OK to release.');
      cleanup();
    }
  };

  const testAnnounce = () => {
    announce('This is a screen reader announcement!', 'polite');
    alert('Announcement sent to screen readers');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Focus Management
        </h2>
        <div id="focus-trap-demo" style={{ padding: '16px', border: '2px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ marginBottom: '12px' }}>Focus Trap Demo Area</p>
          <input type="text" placeholder="First input" style={{ marginRight: '8px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          <input type="text" placeholder="Second input" style={{ marginRight: '8px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          <button style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Button
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={testFocusTrap}>Test Focus Trap</Button>
          <Button onClick={testAnnounce} variant="outline">Test Screen Reader Announcement</Button>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Intersection Observer
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '12px' }}>Lazy Load Demo:</p>
          <div ref={lazyRef as any} style={{ padding: '32px', background: shouldLoad ? '#10b981' : '#e5e7eb', borderRadius: '8px', textAlign: 'center', color: shouldLoad ? 'white' : 'black' }}>
            {shouldLoad ? '✅ Loaded!' : '⏳ Waiting to load...'}
          </div>
        </div>

        <div>
          <p style={{ marginBottom: '12px' }}>Scroll Animation Demo:</p>
          <div style={{ height: '400px', overflowY: 'auto', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <div style={{ height: '800px' }}>
              <p>Scroll down to see the animation trigger...</p>
              <div ref={scrollRef as any} style={{
                marginTop: '400px',
                padding: '32px',
                background: isVisible ? '#3b82f6' : '#e5e7eb',
                borderRadius: '8px',
                textAlign: 'center',
                color: isVisible ? 'white' : 'black',
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                transition: 'all 0.5s ease'
              }}>
                {isVisible ? '🎯 Visible!' : '👁️ Not visible yet'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper Components
function StatusCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{title}</span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

function FeatureBadge({ name, status }: { name: string; status: 'active' | 'ready' | 'disabled' }) {
  const colors = {
    active: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    ready: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
    disabled: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  };
  const color = colors[status];

  return (
    <div style={{
      padding: '8px 12px',
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      color: color.text,
    }}>
      {name}
    </div>
  );
}

function MetricCard({ title, metric }: { title: string; metric: any }) {
  if (!metric) {
    return (
      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9ca3af' }}>-</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: getRatingColor(metric.rating) }}>
        {Math.round(metric.value)}{title === 'CLS' ? '' : 'ms'}
      </div>
      <Badge variant={getRatingVariant(metric.rating)} style={{ marginTop: '8px' }}>
        {metric.rating}
      </Badge>
    </div>
  );
}

// Helper Functions
function getQualityColor(quality: string): string {
  const colors: Record<string, string> = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444',
    offline: '#6b7280',
  };
  return colors[quality] || '#6b7280';
}

function getBatteryColor(level: number | null): string {
  if (!level) return '#6b7280';
  if (level < 0.2) return '#ef4444';
  if (level < 0.5) return '#f59e0b';
  return '#10b981';
}

function getRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    good: '#10b981',
    'needs-improvement': '#f59e0b',
    poor: '#ef4444',
  };
  return colors[rating] || '#6b7280';
}

function getRatingVariant(rating: string): 'success' | 'warning' | 'error' {
  if (rating === 'good') return 'success';
  if (rating === 'needs-improvement') return 'warning';
  return 'error';
}

function getBatteryBadgeVariant(category: string | null): 'success' | 'warning' | 'error' | 'default' {
  if (category === 'high') return 'success';
  if (category === 'medium') return 'warning';
  if (category === 'low' || category === 'critical') return 'error';
  return 'default';
}
