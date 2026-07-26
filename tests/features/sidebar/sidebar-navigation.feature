Feature: Sidebar navigation

  Scenario: User navigates to playlists landing
    When the user clicks on "Library" in navigation menu
    Then the page title should be "Library"
    When the user clicks on "Playlists" in navigation menu
    Then the page title should be "Playlists"
    When the user clicks on "Sound Effects" in navigation menu
    Then the page title should be "Sound Effects"
    When the user clicks on "Tags" in navigation menu
    Then the page title should be "Tags"