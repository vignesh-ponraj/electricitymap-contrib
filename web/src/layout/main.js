/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
// TODO(olc): re-enable this rule

import React from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Layout
import Header from './header';
import LayerButtons from './layerbuttons';
import LeftPanel from './leftpanel';
import Legend from './legend';
import Tabs from './tabs';
import Map from './map';

// Modules
import { __ } from '../helpers/translation';
import { isNewClientVersion } from '../helpers/environment';
import { useCustomDatetime, useHeaderVisible } from '../hooks/router';
import { useLoadingOverlayVisible } from '../hooks/redux';
import {
  useClientVersionFetch,
  useGridDataPolling,
  useConditionalWindDataPolling,
  useConditionalSolarDataPolling,
} from '../hooks/fetch';
import { dispatchApplication } from '../store';
import OnboardingModal from '../components/onboardingmodal';
import LoadingOverlay from '../components/loadingoverlay';
import Toggle from '../components/toggle';

// TODO: Move all styles from styles.css to here
// TODO: Remove all unecessary id and class tags

const mapStateToProps = state => ({
  brightModeEnabled: state.application.brightModeEnabled,
  electricityMixMode: state.application.electricityMixMode,
  hasConnectionWarning: state.data.hasConnectionWarning,
  version: state.application.version,
});

const Watermark = styled.div`
@media (max-width: 767px) {
  display: none !important;
}
`;

const MapContainer = styled.div`
  @media (max-width: 767px) {
    display: ${props => props.pathname !== '/map' ? 'none !important' : 'block' };
  }
`;

const Main = ({
  brightModeEnabled,
  electricityMixMode,
  hasConnectionWarning,
  version,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const datetime = useCustomDatetime();
  const headerVisible = useHeaderVisible();
  
  const showLoadingOverlay = useLoadingOverlayVisible();
  
  // Check for the latest client version once initially.
  useClientVersionFetch();
  
  // Start grid data polling as soon as the app is mounted.
  useGridDataPolling();
  
  // Poll wind data if the toggle is enabled.
  useConditionalWindDataPolling();
  
  // Poll solar data if the toggle is enabled.
  useConditionalSolarDataPolling();
  
  
  return (
    <React.Fragment>
      <div
        style={{
          position: 'fixed', /* This is done in order to ensure that dragging will not affect the body */
          width: '100vw',
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column', /* children will be stacked vertically */
          alignItems: 'stretch', /* force children to take 100% width */
        }}
      >
        {headerVisible && <Header />}
        <div id="inner">
          <LoadingOverlay visible={showLoadingOverlay} />
          <LeftPanel />
          <MapContainer pathname={location.pathname} id="map-container">
            <Map />
            <Watermark id="watermark" className={`watermark ${brightModeEnabled ? 'brightmode' : ''}`}>
              <a href="http://www.tmrow.com/?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=watermark" target="_blank">
                <div id="built-by-tomorrow" />
              </a>
            </Watermark>
            <Legend />
            <div className="controls-container">
              <Toggle
                infoHTML={__('tooltips.cpinfo')}
                onChange={value => dispatchApplication('electricityMixMode', value)}
                options={[
                  { value: 'production', label: __('tooltips.production') },
                  { value: 'consumption', label: __('tooltips.consumption') },
                ]}
                value={electricityMixMode}
              />
            </div>
            <LayerButtons />
          </MapContainer>

          <div id="connection-warning" className={`flash-message ${hasConnectionWarning ? 'active' : ''}`}>
            <div className="inner">
              {__('misc.oops')}
              {' '}
              <a
                href=""
                onClick={(e) => {
                  dispatch({ type: 'GRID_DATA_FETCH_REQUESTED', payload: { datetime } });
                  e.preventDefault();
                }}
              >
                {__('misc.retrynow')}
              </a>
              .
            </div>
          </div>
          <div id="new-version" className={`flash-message ${isNewClientVersion(version) ? 'active' : ''}`}>
            <div className="inner">
              <span dangerouslySetInnerHTML={{ __html: __('misc.newversion') }} />
            </div>
          </div>

          { /* end #inner */}
        </div>
        <Tabs />
      </div>
      <OnboardingModal />
    </React.Fragment>
  );
};

export default connect(mapStateToProps)(Main);
