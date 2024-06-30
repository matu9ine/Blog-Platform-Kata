import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import { useDispatch } from 'react-redux'
import Button from '@mui/material/Button'
import { message, Popconfirm } from 'antd'

import { AppDispatch } from '@/store'
import { selectIsAuth } from '@/assets/types/storeTypes'
import { useTypedSelector } from '@/hooks/useTypedSelector'
import {
  deleteArticle,
  followArticle,
  setIsEditing,
  unFollowArticle,
  setCurrentArticle,
} from '@/store/slices/articleSlice'
import { Article as ArticleType } from '@/assets/types/articleTypes'

import styles from './Article.module.scss'

const Img = styled('img')({
  display: 'block',
  width: '46px',
  height: '46px',
  objectFit: 'cover',
})

interface ArticleProps {
  article: ArticleType
  isFullArticle: boolean
}

export const Article: React.FC<ArticleProps> = ({ article, isFullArticle }) => {
  const { title, slug, description, body, favoritesCount, tagList, createdAt, favorited, author } = article
  const { image, username } = author
  const isAuth = useTypedSelector(selectIsAuth)
  const { isFollowProcess } = useTypedSelector((state) => state.article)
  const navigate = useNavigate()
  const userData = useTypedSelector((state) => state.auth.data)
  const currentUserName = userData?.username ?? 'Default Username'
  const dispatch = useDispatch<AppDispatch>()
  const onFollow = () => {
    dispatch(setCurrentArticle(slug))
    if (!isAuth) {
      navigate('/sign-in')
    } else {
      if (favorited) dispatch(unFollowArticle())
      if (!favorited) dispatch(followArticle())
    }
  }
  const articleContent = (
    <article className={`${styles.article} ${isFullArticle ? styles.article__Full : ''}`}>
      <header className={styles.header}>
        {!isFullArticle ? (
          <Link className={styles.link} to={`/articles/${slug}`}>
            <h2 className={styles.title}>{title}</h2>
          </Link>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )}
        <div className={styles.likes}>
          <IconButton
            className={`${styles.button__like} ${styles.button}`}
            disabled={isFollowProcess}
            aria-label="like"
            size="medium"
            sx={{ marginRight: '8px' }}
            onClick={() => {
              onFollow()
            }}
          >
            {favorited ? (
              <FavoriteIcon className={styles['color-active']} />
            ) : (
              <FavoriteBorder className={styles.color} />
            )}
          </IconButton>
          <p className={styles.likes__count}>{favoritesCount}</p>
        </div>
        <div className={styles.tags}>
          {tagList
            ? tagList.map((tag) =>
                tag ? (
                  <div className={styles.tag} key={uuidv4()}>
                    {tag}
                  </div>
                ) : (
                  ''
                )
              )
            : ''}
        </div>
        <div className={styles.profile}>
          <div className={styles.name}>{username}</div>
          <div className={styles.time}>{createdAt ? format(new Date(createdAt), 'MMMM d, yyyy') : 'UNKNOWN'}</div>
          <div className={styles.logo}>
            <Img className={styles.logo__img} src={image} alt="logo" />
          </div>
        </div>
      </header>
      <div className={`${styles.text} ${isFullArticle ? styles.text__Full : ''}`}>
        {description}
        {currentUserName === username && isAuth && isFullArticle && (
          <div className={styles.buttons}>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={async () => {
                try {
                  await dispatch(deleteArticle())
                  navigate('/')
                  message.open({
                    type: 'success',
                    content: 'Article it was successfully deleted',
                    duration: 5,
                  })
                } catch (error) {
                  message.open({
                    type: 'error',
                    content: 'error',
                    duration: 5,
                  })
                }
              }}
              okText="Yes"
              cancelText="No"
              placement="right"
            >
              <Button className={`${styles.button__delete} ${styles.button}`} variant="outlined">
                Delete
              </Button>
            </Popconfirm>
            <Button
              component={Link}
              to={`/articles/${slug}/edit`}
              role="button"
              aria-label="Sign up for an account"
              onClick={() => dispatch(setIsEditing())}
              className={`${styles.button__edit} ${styles.button}`}
              variant="outlined"
              color="success"
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      {isFullArticle && (
        <div className={styles.body}>
          <ReactMarkdown className={styles.reactMarkdown}>{body}</ReactMarkdown>
        </div>
      )}
    </article>
  )
  return <div className={styles.root}>{articleContent}</div>
}
