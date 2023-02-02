import { Interweave } from "interweave"
import {
  Email,
  EmailMatcher,
  Hashtag,
  HashtagMatcher,
  Url,
  UrlMatcher,
} from "interweave-autolink"
import React from "react"
//import { MentionMatcher } from "../../utils/interweave-mention/Matcher"
//import { Mention } from "../../utils/interweave-mention/Mention"

export const AutoLinkedText: React.FC<{ children: string }> = ({
  children,
}) => (
  <Interweave
    content={children}
    matchers={[
      new UrlMatcher("url", {}, (args) => <Url {...args} newWindow={true} />),
      new HashtagMatcher("hashtag", {}, (args) => (
        <Hashtag
          hashtagUrl={(url) => `https://twitter.com/hashtag/${url}`}
          newWindow={true}
          {...args}
        />
      )),
      new EmailMatcher("email", {}, (args) => (
        <Email {...args} newWindow={true} />
      )),
      // TODO: MentionMatcher
      /*new MentionMatcher("mention", {}, (args) => (
        <Mention
          mentionUrl={(mentionTo) => `https://twitter.com/${mentionTo}`}
          newWindow={true}
          {...args}
        />
      )),*/
    ]}
  />
)
