import { TopicCreateType, TopicType } from 'src/entities/journal/TopicType'

export const convertTopicData = (data: TopicType) => {
  const topicCreate = <TopicCreateType>{}

  topicCreate.id = data.id
  topicCreate.title = data.title
  topicCreate.level = data.level
  topicCreate.period = data.period
  topicCreate.classyear = data.classyear
  topicCreate.subject = data.subject
  topicCreate.content = data.content
  topicCreate.language = data.language
  topicCreate.tags = data.tags
  topicCreate.book_page = data.book_page
  topicCreate.relation_ids = data.relation_ids

  return topicCreate
}
