Feature: Create a model
  A call to create a model should return an instance of model

  Scenario: Create a metamodel
    Given a grammar
    When I try to create a metamodel
    Then I should get an instance of MetaModel

  @model
  Scenario: Initialize a metamodel
    Given a model
    When I try to initialize a model
    Then I should get an instance of Model with the model property set

  Scenario: Create a model without a root
    Given a grammar without a root
    When I try to create a model
    Then I should get an error

  Scenario: Create a model with a root
    Given a grammar with a root
    When I try to create a model
    Then I should get a model