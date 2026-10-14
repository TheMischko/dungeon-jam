@playlists @playback @audio
Feature: Local audio playback audibility

  Background:
    Given there is a playlist prepared called "Audibility Test Playlist"
    And there is a track prepared from fixture "a-minor"
    And the user clicks on "Playlists" in navigation menu
    And the user opens the playlist detail for "Audibility Test Playlist"
    And the user clicks "Add tracks from library" on the playlist detail page
    And the user selects the track "A Minor" in the select tracks modal
    And the user clicks save in the select tracks modal
    And the playlist detail page should display the track "A Minor"

  Scenario: Application emits audible sound when playback is started
    When the user starts playback of the current playlist
    Then the application should be producing audible sound within 5 seconds

  Scenario: Application emits silence when playback is not active
    Given the playback is stopped
    Then the application should not be producing audible sound
