import RCS Agents / Library / Nike Agent as Nike

agent Nike Support Agent

  displayName: Nike.displayName
  brandName: Nike.brandName

  flow Default
    :start -> WelcomeMessage

    :WelcomeMessage -> MainMenu

    :MainMenu -> TechIssueSelectedMessage

    :MainMenu -> BillingInquirySelectedMessage

    :MainMenu -> ConfirmAgentTransferMessage

    :MainMenu -> InvalidOptionMessage

    :TechIssueSelectedMessage -> TechSupportFollowUpMessage

    :BillingInquirySelectedMessage -> BillingFollowUpMessage

    :ConfirmAgentTransferMessage -> AgentTransferInProgressMessage

    :ConfirmAgentTransferMessage -> MainMenu

    :AgentTransferInProgressMessage -> EndConversationThanksMessage

    :InvalidOptionMessage -> MainMenu

    :TechSupportFollowUpMessage -> MainMenu

    :BillingFollowUpMessage -> MainMenu

    :EndConversationThanksMessage -> MainMenu

  messages Messages

    message WelcomeMessage
      text: "Welcome to Nike Digital Support! I'm here to help you. What would you like to do?"

      suggestion
        reply "See options"

    message MainMenu
      text: "How can I assist you today? Please choose an option:"
      suggestions: ("Technical Issue", "Billing Inquiry", "Speak to Agent")

    message TechIssueSelectedMessage
      text: "You've selected Technical Issue. Please describe the problem so I can assist further."

    message BillingInquirySelectedMessage
      text: "You've selected Billing Inquiry. What is your specific billing question?"

    message ConfirmAgentTransferMessage
      text: "Just to confirm, you wish to be transferred to a live agent?"
      suggestions: ("Yes, transfer me", "No, not now")

    message AgentTransferInProgressMessage
      text: "Thank you. Connecting you to an available agent. Please wait a moment."

    message InvalidOptionMessage
      text: "I'm sorry, that wasn't a recognized option. Please select from the main menu choices."
      suggestions: ("Back to Menu")

    message TechSupportFollowUpMessage
      text: "I hope that information was helpful! Is there anything else I can assist you with today?"
      suggestions: ("Back to Main Menu", "Speak to Agent")

    message BillingFollowUpMessage
      text: "I hope I was able to help with your billing inquiry. Is there anything else you need assistance with?"
      suggestions: ("Back to Main Menu", "Speak to Agent")

    message EndConversationThanksMessage
      text: "Thank you for contacting Nike Digital Support! Have a wonderful day. If you need further assistance, feel free to return to the main menu."
      suggestions: ("Back to Main Menu")
