# Projection

A projection is a representation of a concept that can be visualized and interacted with in the graphical user interface (GUI).
Multiple projections may be defined for a single concept so as to allow different representation and level of granularity.

> **Example**  
> Consider the concept `Person` with attributes such as `name`, `age`, `height`, `shape`, and `type`.  
To manipulate a collection of `Person`, a *Table* is a highly efficient notation to make changes, but does not offer
enough flexibility for viewing purposes. However, a *List* which is less rigid in both structure and presentation
fit perfectly with this scenario.  
Therefore, a good strategy would be to define a projection per use cases:  
**(1)** Edit a *Person* and view all their attributes `->` Table projection  
**(2)** Enumerate all the defined *Person* showing only their *name* `->` List projection

Every projection is a composition of *layout*, *field* and *static* elements; all rendered as HTML elements.
They can be customized, individually or globally, directly with *style* rules or though external *CSS*.

## Layout

A layout element is used to organize elements presented in the GUI.

### WrapLayout

The *WrapLayout* is the simplest of all the layouts. It groups its child elements in a container that is fit to its children

### StackLayout

The *StackLayout* adds control over one dimension. It arranges its child elements on either a vertical or a horizontal axis.

- Properties
  - **Orientation** `[string={horizontal|vertical}]` (*required*): indicates which direction the *StackLayout* should stack its children.

### FlexLayout

The *FlexLayout* adds flexibility to the *StackLayout*. It offers the ability to wrap its children.

- Properties
  - **Orientation** `[string={row|column}]` (*required*): indicates which direction the *FlexLayout* should arrange its children.
  - **Wrappable** `[boolean]`: indicates whether a line can wrap its content on several lines.
  - **Align-items** `[string={start|end|center|stretch|baseline}]`: defines the children alignment.
  - **Justify-content** `[string={start|end|center|space-between|space-around|space-evenly}]`: defines the anchoring of the children

### TableLayout

The *TableLayout* adds control over two dimensions. It arranges its child elements on cells grouped in rows.

## Field

A field element is used to receive and process input and output.
Gentleman defines the following fields:

### TextField

The *TextField* can capture key input.

#### Compatibility

- String concept
- Number concept

#### Properties

- **resizable** `[boolean]`: indicates whether the control should fit its content
- **multiline** `[boolean]` (*required*): indicates whether the content can span across multiple lines
- **input**: The field control receiving the input
  - **type**`[string={text|number|email|tel|url}]: type of expected input
  - **placeholder**`[string]: Text that appears in the control when it is empty (no value set)

### BinaryField

The *BinaryField* can alternate between two states: *true-state* and *false-state*.

#### Compatibility

- Boolean concept
- Derivative concept with restricted values (enum)

#### Properties

- **True-state** `[set:element]`: content displayed when the state is *true*
- **False-state** `[set:element]`: content displayed when the state is *false*

### ChoiceField

The *ChoiceField* can group related choices.

#### Compatibility

- Prototype concept
- Boolean concept
- Derivative concept with restricted values (enum)

#### Properties

- **expanded** `[boolean=true]`: indicates whether the options are enumerated or put in a drop-down list
- **placeholder** `[string]`: represents the 'empty' option
- **input**: filter control to search the list of option
  - **type** `[string=text]`: type of expected input
  - **placeholder** `[string]`: Text that appears in the control when it is empty (no value set)
- **choice template**: Template used for the choice options

### ListField

The *ListField* can manage a collection of element.

#### Compatibility

- Set concept

#### Properties

- **action**: actions available for the list
  - **add**`[element]: Content displayed for the add *action* button
  - **remove**`[element]: Content displayed for the *remove* action button
- **item template**: Template used for the list items

### TableField

The *TableField* can manage tabular data.

- Compatibility
  - Set concept

## Static

A static element is used to present static content.

### Text

The *Stactic text* is used to display textual content.

#### Properties

- **content** `[string]` (*required*): Text content.
- **contentType** `[string={raw|html|property}]`: Defines how the content should be processed

### Image

The *Stactic image* is used to display images.

#### Properties

- **url** `[string]`: Defines the image's url
- **width** `[number]` (*optional*): Defines the image width
- **height** `[number]` (*optional*): Defines the image height

### Link

The *Stactic link* is used to display links.

#### Properties

- **content** `[set:element]` (*required*): Defines link's displayed content
- **url** `[string]` (*required*): Defines the link's url
- **urlType** `[string={link|email|phone}]`: Defines how the link should be processed

### HTML

The *Stactic HTML* is used to insert HTML Templates declared on the page.

## Style

To style your elements, you can do it directly when defining a projection or though CSS.

### CSS

Gentleman support CSS class selectors by allowing you to declare them in your projections and by exposing for each rendered element, some class selectors.

### Style rule

A style rule is defined by a name with a list of rule.

## Template

A template allows you to declare reusable block of elements.
