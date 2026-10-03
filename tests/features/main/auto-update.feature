Feature: Auto Update & New Version Available Modal

  @updates
  Scenario: User skips an update and the modal does not reappear on reload or restart
    Given an update to version "2.0.0" is available
    When the application is started
    Then the update server should have received update check request
    And the "New update available" modal should be visible
    And the update modal should display version "2.0.0"
    When the user clicks "Cancel" in the update modal
    Then the update modal should be closed
    And the skipped version in preferences should be "2.0.0"
    When the application is reloaded
    Then the update modal should not be displayed
    When the application is restarted
    Then the update modal should not be displayed

  @updates
  Scenario: User installs an update and modal does not appear after restarting into the new version
    Given an update to version "2.0.0" is available
    When the application is started
    Then the "New update available" modal should be visible
    When the user clicks "Install and reload" in the update modal
    Then the update modal should be closed
    And the update preferences should be empty
    When the application is restarted with version "2.0.0"
    Then the update modal should not be displayed

  @updates
  Scenario: A newer version becomes available after user skipped a previous version
    Given the user previously skipped version "2.0.0"
    And an update to version "2.1.0" is available
    When the application is started
    Then the "New update available" modal should be visible
    And the update modal should display version "2.1.0"
    When the user clicks "Cancel" in the update modal
    Then the update modal should be closed
    When the application is reloaded
    Then the update modal should not be displayed

  @updates
  Scenario: Application is up to date and does not display update modal
    Given no updates are available on update server
    When the application is started
    Then the update server should have received update check request
    And the update modal should not be displayed

  @updates
  Scenario: Modal does not unexpectedly reopen while navigating through application
    Given an update to version "2.0.0" is available
    When the application is started
    Then the "New update available" modal should be visible
    When the user clicks "Cancel" in the update modal
    Then the update modal should be closed
    When the user clicks on "Library" in navigation menu
    Then the update modal should not be displayed
    When the user clicks on "Playlists" in navigation menu
    Then the update modal should not be displayed
    When the user clicks on "Sound Effects" in navigation menu
    Then the update modal should not be displayed
    When the user clicks on "Tags" in navigation menu
    Then the update modal should not be displayed

  @updates @settings
  Scenario: User manually checks for updates in settings when application is up to date
    Given no updates are available on update server
    When the application is started
    And the user clicks on "Settings" in navigation menu
    And the user clicks on "Check updates" in settings
    Then a notification stating "Application is up to date" should be displayed
    And the update modal should not be displayed

  @updates @settings
  Scenario: User manually checks for updates in settings when a new update is available
    Given an update to version "2.0.0" is available
    And the user previously skipped version "2.0.0"
    When the application is started
    Then the update modal should not be displayed
    When the user clicks on "Settings" in navigation menu
    And the user clicks on "Check updates" in settings
    Then the "New update available" modal should be visible
    And the update modal should display version "2.0.0"
