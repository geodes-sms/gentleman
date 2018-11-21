Feature: Create and initialize a model element
  Having a model, it should be possible to create element from the metamodel

  Background:
    Given a metamodel

  Scenario: Create a model element
    Given a model and a source template
    When a new model element is created
    Then it should be an instance of ModelElement
    And it should have the model and source attached to it