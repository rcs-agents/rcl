import type { Section, Attribute } from '../../generated/ast.js';
import { ValueConverter } from './value-converter.js';

/**
 * Converts RCL message sections to agent message JSON format
 * matching the agent-message.schema.json schema
 */
export class MessageConverter {
  private valueConverter: ValueConverter;

  constructor() {
    this.valueConverter = new ValueConverter();
  }

  /**
   * Convert a message section to agent message JSON
   */
  convert(messageSection: Section): Record<string, any> {
    const message: Record<string, any> = {};
    
    // Extract message attributes
    const messageAttributes = this.valueConverter.convertAttributes(messageSection.attributes);
    
    // Determine message traffic type from section type
    const trafficType = this.getTrafficType(messageSection);
    if (trafficType) {
      message.messageTrafficType = trafficType;
    }

    // Create content message
    const contentMessage = this.createContentMessage(messageSection, messageAttributes);
    if (contentMessage && Object.keys(contentMessage).length > 0) {
      message.contentMessage = contentMessage;
    }

    // Handle TTL and expiration
    if (messageAttributes.ttl) {
      message.ttl = messageAttributes.ttl;
    }

    if (messageAttributes.expireTime) {
      message.expireTime = messageAttributes.expireTime;
    }

    return message;
  }

  /**
   * Determine traffic type from section type
   */
  private getTrafficType(messageSection: Section): string | null {
    const sectionType = messageSection.sectionType.toLowerCase();
    
    if (sectionType.includes('authentication')) {
      return 'AUTHENTICATION';
    } else if (sectionType.includes('transaction')) {
      return 'TRANSACTION';
    } else if (sectionType.includes('promotion')) {
      return 'PROMOTION';
    } else if (sectionType.includes('servicerequest')) {
      return 'SERVICEREQUEST';
    } else if (sectionType.includes('acknowledge')) {
      return 'ACKNOWLEDGEMENT';
    }
    
    return 'MESSAGE_TRAFFIC_TYPE_UNSPECIFIED';
  }

  /**
   * Create content message object
   */
  private createContentMessage(messageSection: Section, messageAttributes: Record<string, any>): Record<string, any> {
    const contentMessage: Record<string, any> = {};

    // Handle text message
    if (messageAttributes.text) {
      contentMessage.text = messageAttributes.text;
    }

    // Handle file name
    if (messageAttributes.fileName) {
      contentMessage.fileName = messageAttributes.fileName;
    }

    // Handle uploaded RBM file
    if (messageAttributes.uploadedRbmFile) {
      contentMessage.uploadedRbmFile = this.processUploadedRbmFile(messageAttributes.uploadedRbmFile);
    }

    // Handle rich card
    if (messageAttributes.richCard) {
      contentMessage.richCard = this.processRichCard(messageAttributes.richCard);
    }

    // Handle content info
    if (messageAttributes.contentInfo) {
      contentMessage.contentInfo = this.processContentInfo(messageAttributes.contentInfo);
    }

    // Handle suggestions
    if (messageAttributes.suggestions) {
      contentMessage.suggestions = this.processSuggestions(messageAttributes.suggestions);
    }

    // Process nested attributes for complex message components
    for (const nestedAttr of messageSection.nestedAttributes) {
      this.processNestedMessageAttribute(contentMessage, nestedAttr.key, nestedAttr.attributes);
    }

    return contentMessage;
  }

  /**
   * Process uploaded RBM file
   */
  private processUploadedRbmFile(fileData: any): Record<string, any> {
    const file: Record<string, any> = {};
    
    if (fileData.fileName) {
      file.fileName = fileData.fileName;
    }

    if (fileData.contentDescription) {
      file.contentDescription = fileData.contentDescription;
    }

    if (fileData.thumbnailContentInfo) {
      file.thumbnailContentInfo = this.processContentInfo(fileData.thumbnailContentInfo);
    }

    return file;
  }

  /**
   * Process rich card
   */
  private processRichCard(richCardData: any): Record<string, any> {
    const richCard: Record<string, any> = {};
    
    if (richCardData.standaloneCard) {
      richCard.standaloneCard = this.processStandaloneCard(richCardData.standaloneCard);
    }
    
    if (richCardData.carouselCard) {
      richCard.carouselCard = this.processCarouselCard(richCardData.carouselCard);
    }

    return richCard;
  }

  /**
   * Process standalone card
   */
  private processStandaloneCard(cardData: any): Record<string, any> {
    const card: Record<string, any> = {};
    
    if (cardData.cardContent) {
      card.cardContent = this.processCardContent(cardData.cardContent);
    }

    if (cardData.suggestions) {
      card.suggestions = this.processSuggestions(cardData.suggestions);
    }

    return card;
  }

  /**
   * Process card content
   */
  private processCardContent(contentData: any): Record<string, any> {
    const content: Record<string, any> = {};
    
    if (contentData.title) {
      content.title = contentData.title;
    }

    if (contentData.description) {
      content.description = contentData.description;
    }

    if (contentData.media) {
      content.media = this.processMedia(contentData.media);
    }

    return content;
  }

  /**
   * Process media content
   */
  private processMedia(mediaData: any): Record<string, any> {
    const media: Record<string, any> = {};
    
    if (mediaData.height) {
      media.height = mediaData.height;
    }

    if (mediaData.contentInfo) {
      media.contentInfo = this.processContentInfo(mediaData.contentInfo);
    }

    return media;
  }

  /**
   * Process content info for media
   */
  private processContentInfo(contentData: any): Record<string, any> {
    const content: Record<string, any> = {};
    
    if (contentData.fileUrl) {
      content.fileUrl = contentData.fileUrl;
    }

    if (contentData.altText) {
      content.altText = contentData.altText;
    }

    if (contentData.forceRefresh) {
      content.forceRefresh = contentData.forceRefresh;
    }

    return content;
  }

  /**
   * Process carousel card
   */
  private processCarouselCard(cardData: any): Record<string, any> {
    const card: Record<string, any> = {};
    
    if (cardData.cardWidth) {
      card.cardWidth = cardData.cardWidth;
    }

    if (cardData.cardContents) {
      card.cardContents = this.processCarouselCardContents(cardData.cardContents);
    }

    return card;
  }

  /**
   * Process carousel card contents
   */
  private processCarouselCardContents(contentsData: any): any[] {
    if (Array.isArray(contentsData)) {
      return contentsData.map(content => this.processCardContent(content));
    }
    return [];
  }

  /**
   * Process suggestions
   */
  private processSuggestions(suggestionsData: any): any[] {
    if (Array.isArray(suggestionsData)) {
      return suggestionsData.map(suggestion => this.processSuggestion(suggestion));
    }
    return [];
  }

  /**
   * Process a single suggestion
   */
  private processSuggestion(suggestionData: any): Record<string, any> {
    const suggestion: Record<string, any> = {};
    
    if (suggestionData.action) {
      suggestion.action = this.processSuggestionAction(suggestionData.action);
    }

    if (suggestionData.reply) {
      suggestion.reply = this.processSuggestedReply(suggestionData.reply);
    }

    return suggestion;
  }

  /**
   * Process suggestion action
   */
  private processSuggestionAction(actionData: any): Record<string, any> {
    const action: Record<string, any> = {};
    
    if (actionData.text) {
      action.text = actionData.text;
    }

    if (actionData.postbackData) {
      action.postbackData = actionData.postbackData;
    }

    if (actionData.fallbackUrl) {
      action.fallbackUrl = actionData.fallbackUrl;
    }

    // Handle different action types
    if (actionData.openUrlAction) {
      action.openUrlAction = {
        url: actionData.openUrlAction.url
      };
    }

    if (actionData.dialAction) {
      action.dialAction = {
        phoneNumber: actionData.dialAction.phoneNumber
      };
    }

    if (actionData.composeAction) {
      action.composeAction = this.processComposeAction(actionData.composeAction);
    }

    if (actionData.viewLocationAction) {
      action.viewLocationAction = this.processViewLocationAction(actionData.viewLocationAction);
    }

    if (actionData.shareLocationAction) {
      action.shareLocationAction = {};
    }

    if (actionData.createCalendarEventAction) {
      action.createCalendarEventAction = this.processCreateCalendarEventAction(actionData.createCalendarEventAction);
    }

    return action;
  }

  /**
   * Process suggested reply
   */
  private processSuggestedReply(replyData: any): Record<string, any> {
    const reply: Record<string, any> = {};
    
    if (replyData.text) {
      reply.text = replyData.text;
    }

    if (replyData.postbackData) {
      reply.postbackData = replyData.postbackData;
    }

    return reply;
  }

  /**
   * Process compose action
   */
  private processComposeAction(composeData: any): Record<string, any> {
    const compose: Record<string, any> = {};
    
    if (composeData.composeTextMessage) {
      compose.composeTextMessage = {
        text: composeData.composeTextMessage.text
      };
    }

    if (composeData.composeRecordingMessage) {
      compose.composeRecordingMessage = {};
    }

    return compose;
  }

  /**
   * Process view location action
   */
  private processViewLocationAction(locationData: any): Record<string, any> {
    const location: Record<string, any> = {};
    
    if (locationData.label) {
      location.label = locationData.label;
    }

    if (locationData.latLong) {
      location.latLong = {
        latitude: locationData.latLong.latitude,
        longitude: locationData.latLong.longitude
      };
    }

    if (locationData.query) {
      location.query = locationData.query;
    }

    return location;
  }

  /**
   * Process create calendar event action
   */
  private processCreateCalendarEventAction(eventData: any): Record<string, any> {
    const event: Record<string, any> = {};
    
    if (eventData.startTime) {
      event.startTime = eventData.startTime;
    }

    if (eventData.endTime) {
      event.endTime = eventData.endTime;
    }

    if (eventData.title) {
      event.title = eventData.title;
    }

    if (eventData.description) {
      event.description = eventData.description;
    }

    return event;
  }

  /**
   * Process nested message attributes
   */
  private processNestedMessageAttribute(contentMessage: Record<string, any>, key: string, attributes: Attribute[]): void {
    const nestedValues = this.valueConverter.convertAttributes(attributes);
    
    switch (key.toLowerCase()) {
      case 'richcard':
        contentMessage.richCard = this.processRichCard(nestedValues);
        break;
      case 'suggestions':
        contentMessage.suggestions = this.processSuggestions(nestedValues);
        break;
      case 'contentinfo':
        contentMessage.contentInfo = this.processContentInfo(nestedValues);
        break;
    }
  }
} 