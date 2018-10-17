Feature: Optional attribute property
  A required attribute must have a value whereas an optional attribute can have a value.

  Scenario Outline: Validate a required/optional attribute
    Given an attribute is <optional>
    When I give it the <value>
    Then the attribute should be <valid>
    Then I should get a <message>

  Examples:
    | optional | value | valid | message |
    |     true |    "" |  true |   false | #optional
    |     true |  "ok" |  true |   false | #optional
    |    false |    "" | false |    true | #required
    |    false |  "ok" |  true |   false | #required