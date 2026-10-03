@library @playback @audio @search
Feature: Library Search and Direct Playback

  Scenario: User can filter tracks in library using search
    Given there are tracks prepared from fixtures "a-minor, b-minor"
    And the user clicks on "Library" in navigation menu
    Then the library should display the track "A Minor"
    And the library should display the track "B Minor"
    When the user searches for "A Minor" in library
    Then the library should display the track "A Minor"
    And the library should not display the track "B Minor"
    When the user searches for "Nonexistent Track" in library
    Then the library should display no search results message
    When the user clears the search in library
    Then the library should display the track "A Minor"
    And the library should display the track "B Minor"

  Scenario: User can play tracks directly from library table
    Given there are tracks prepared from fixtures "a-minor, b-minor"
    And the user clicks on "Library" in navigation menu
    When the user hovers over library track "A Minor" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"
    When the user hovers over library track "B Minor" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "B Minor"
