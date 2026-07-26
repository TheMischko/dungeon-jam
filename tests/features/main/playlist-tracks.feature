@playlists @library
Feature: Add tracks to a playlist

  Background:
    Given there is a playlist prepared called "Rock Essentials"
    And there is a track prepared from fixture "a-minor"
    And there is a track prepared from fixture "b-minor"
    And the user clicks on "Playlists" in navigation menu

  Scenario: User adds library tracks to a playlist via the add tracks modal
    When the user opens the playlist detail for "Rock Essentials"
    And the user clicks "Add tracks from library" on the playlist detail page
    And the user selects the track "A Minor" in the select tracks modal
    And the user selects the track "B Minor" in the select tracks modal
    And the user clicks save in the select tracks modal
    Then the playlist detail page should display the track "A Minor"
    And the playlist detail page should display the track "B Minor"
