@library
Feature: Library audio upload via drag-and-drop

  Background:
    Given the user clicks on "Library" in navigation menu

  Scenario: Upload audio fixture files to the library via drag-and-drop
    When the user drops the audio fixture files onto the library drop zone
    And the user clicks "Review Each File" in the bulk upload modal
    And the user confirms all tracks in the upload modal
    Then the library should display the track "A Minor"
    And the library should display the track "B Minor"
    And the library should display the track "E Minor"
    And the library should display the track "G Minor Longer"
