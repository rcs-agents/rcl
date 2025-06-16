
defmodule AgentMessage.Examples.TextMessage do
  use AgentMessage.Dsl

  Config do

    PhoneNumbers list (label, phoneNumber):
      - "some label", "+1234567890"
      - "some other label", "+1234567890"
      - "some other label", "+1098765423"
  end

  agentMessage do
    # Root options for the message
    messageTrafficType :TRANSACTION # Other options: :AUTHENTICATION, :PROMOTION, :SERVICEREQUEST, :ACKNOWLEDGEMENT
    expireTime "2024-12-31T23:59:59Z"
    # ttl "P7D" # Alternative to expireTime: "P7D" means 7 days. Mutually exclusive.

    contentMessage do
      text "Hello! This is a transactional message with various suggestions. How can I help you today?"

      # Suggested Reply
      suggestion do
        reply text: "Tell me more", postbackData: "tell_me_more_pb"
      end

      # Suggested Action: Dial
      suggestion do
        action text: "Call Us", postbackData: "dial_action_pb" do
          dialAction phoneNumber: "+1234567890"
        end
      end

      # Suggested Action: Open URL
      suggestion do
        action text: "Visit Website", postbackData: "open_url_pb" do
          openUrlAction url: "https://www.example.com"
        end
      end

      # Suggested Action: Share Location
      suggestion do
        action text: "Share Location", postbackData: "share_location_pb" do
          shareLocationAction # No arguments
        end
      end

      # Suggested Action: View Location (with LatLong)
      suggestion do
        action text: "View Our Office", postbackData: "view_location_latlong_pb" do
          viewLocationAction label: "Our Office Location" do
            latLong latitude: 37.7749, longitude: -122.4194
          end
        end
      end

      # Suggested Action: View Location (with Query)
      suggestion do
        action text: "Search Park", postbackData: "view_location_query_pb" do
          viewLocationAction query: "Golden Gate Park, San Francisco", label: "Nearby Park" do
            # Empty block because only options are used and latLong entity is not.
          end
        end
      end

      # Suggested Action: Create Calendar Event
      suggestion do
        action text: "Book Meeting", postbackData: "create_calendar_pb" do
          createCalendarEventAction startTime: "2025-01-15T10:00:00Z",
                                    endTime: "2025-01-15T11:00:00Z",
                                    title: "Project Discussion",
                                    description: "Discuss project milestones."
        end
      end

      # Suggested Action: Compose Text Message
      suggestion do
        action text: "Send SMS", postbackData: "compose_text_pb" do
          composeAction do
            composeTextMessage phoneNumber: "+19876543210", text: "Regarding my appointment..."
          end
        end
      end

      # Suggested Action: Compose Recording Message (Audio)
      suggestion do
        action text: "Record Audio", postbackData: "compose_audio_pb" do
          composeAction do
            composeRecordingMessage phoneNumber: "+19876543210", type: :ACTION_TYPE_AUDIO
          end
        end
      end

      # Suggested Action: Compose Recording Message (Video)
      # suggestion do
      #   action text: "Record Video", postbackData: "compose_video_pb" do
      #     composeAction do
      #       composeRecordingMessage phoneNumber: "+19876543210", type: :ACTION_TYPE_VIDEO
      #     end
      #   end
      # end

      # Max 11 suggestions for contentMessage. Current: 9
    end
  end
end

defmodule AgentMessage.Examples.FileMessage do
  use AgentMessage.Dsl

  agentMessage do
    messageTrafficType :ACKNOWLEDGEMENT
    ttl "PT1H" # Expires in 1 hour

    contentMessage do
      fileName "receipt_user_device.pdf"
      text "Here is the receipt saved on your device." # Optional text to accompany fileName

      suggestion do
        reply text: "Got it!", postbackData: "ack_file_receipt"
      end
    end
  end
end

defmodule AgentMessage.Examples.UploadedRbmFileMessage do
  use AgentMessage.Dsl

  agentMessage do
    messageTrafficType :TRANSACTION
    expireTime "2024-11-30T12:00:00Z"

    contentMessage do
      # uploadedRbmFile is an option of type :struct, so it takes a map.
      uploadedRbmFile %{
        fileName: "invoice_123.pdf", # Name of the RBM file previously uploaded by the agent
        thumbnailUrl: "https://cdn.example.com/thumbnails/invoice_123_thumb.png", # Optional
        thumbnailName: "invoice_123_thumb_rbm.png" # Optional
      }
      # text "Please find your invoice attached." # Optional text

      suggestion do
        action text: "View Details", postbackData: "view_invoice_123" do
          openUrlAction url: "https://example.com/invoice/123/details"
        end
      end
    end
  end
end

defmodule AgentMessage.Examples.DirectContentInfoMessage do
  use AgentMessage.Dsl

  agentMessage do
    messageTrafficType :PROMOTION
    ttl "P1D" # Expires in 1 day

    contentMessage do
      # contentInfo is an option of type :struct when used directly under contentMessage.
      contentInfo %{
        fileUrl: "https://www.example.com/promo_video.mp4",
        thumbnailUrl: "https://www.example.com/promo_video_thumb.jpg", # Optional
        forceRefresh: false # Optional, defaults to false
        # altText is part of the struct but not in the DSL extension schema for contentInfo as an option.
      }
      text "Check out our new promotional video!" # Optional text

      suggestion do
        reply text: "Cool!", postbackData: "promo_video_cool"
      end
    end
  end
end

defmodule AgentMessage.Examples.StandaloneCardMessage do
  use AgentMessage.Dsl

  agentMessage do
    messageTrafficType :TRANSACTION
    expireTime "2024-12-01T00:00:00Z"

    contentMessage do
      richCard do
        standaloneCard do
          cardOrientation :HORIZONTAL # or :VERTICAL
          # thumbnailImageAlignment is only applicable for HORIZONTAL orientation
          thumbnailImageAlignment :LEFT # or :RIGHT

          cardContent do
            title "Product Showcase"
            description "Explore our latest product with amazing features and a sleek design."

            media do
              height :MEDIUM # :SHORT, :MEDIUM, :TALL
              # contentInfo is an entity under media
              contentInfo do
                fileUrl "https://www.example.com/product_image.jpg"
                thumbnailUrl "https://www.example.com/product_thumbnail.jpg" # Optional
                forceRefresh false
              end
            end

            # Suggestions within a card (Max 4)
            suggestion do
              reply text: "Interested", postbackData: "product_interested_pb"
            end
            suggestion do
              action text: "Learn More", postbackData: "product_learn_more_pb" do
                openUrlAction url: "https://www.example.com/product/details"
              end
            end
            suggestion do
              action text: "Get Price", postbackData: "product_get_price_pb" do
                # Example: A dial action or a specific postback to trigger a flow
                dialAction phoneNumber: "+15550987654"
              end
            end
          end
        end
      end

      # Top-level suggestions (optional, if the rich card itself isn't the only interaction)
      suggestion do
        reply text: "Main Menu", postbackData: "main_menu_pb"
      end
    end
  end
end

defmodule AgentMessage.Examples.CarouselCardMessage do
  use AgentMessage.Dsl

  agentMessage do
    messageTrafficType :PROMOTION
    ttl "P3D"

    contentMessage do
      richCard do
        carouselCard do
          cardWidth :MEDIUM # :SMALL or :MEDIUM

          # cardContents requires 2 to 10 cards.
          # All cards in a carousel must have the same media.height if media is present.

          # Card 1
          cardContent do
            title "Item 1: Modern Watch"
            description "Stylish and smart."
            media do
              height :SHORT # All media in carousel must have this height
              contentInfo do
                fileUrl "https://www.example.com/item1.jpg"
              end
            end
            suggestion do
              action text: "View Item 1", postbackData: "carousel_item1_pb" do
                openUrlAction url: "https://www.example.com/item1"
              end
            end
          end

          # Card 2
          cardContent do
            title "Item 2: Wireless Headphones"
            description "Crystal clear sound."
            media do
              height :SHORT # Consistent media height
              contentInfo do
                fileUrl "https://www.example.com/item2.jpg"
              end
            end
            suggestion do
              action text: "View Item 2", postbackData: "carousel_item2_pb" do
                openUrlAction url: "https://www.example.com/item2"
              end
            end
          end

          # Card 3 (Optional, up to 10)
          cardContent do
            title "Item 3: Smart Speaker"
            description "Your home assistant."
            media do
              height :SHORT # Consistent media height
              contentInfo do
                fileUrl "https://www.example.com/item3.jpg"
              end
            end
            suggestion do
              action text: "View Item 3", postbackData: "carousel_item3_pb" do
                openUrlAction url: "https://www.example.com/item3"
              end
            end
          end
        end
      end

      suggestion do
        reply text: "Exit Carousel", postbackData: "exit_carousel_pb"
      end
    end
  end
end
