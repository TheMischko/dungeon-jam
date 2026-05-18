Feature: Playlist Landing page

  Background:
    Given there is a playlist prepared called "Test Playlist"
    And the user clicks on "Playlists" in navigation menu

  Scenario: Playlist exists
    Then there should be playlist with name "Test Playlist"