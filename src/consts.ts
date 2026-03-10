import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Xerlocked",
  DESCRIPTION: "반갑습니다. 게임 개발자 김근홍입니다.",
  AUTHOR: "Xerlocked",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "블로그",
  DESCRIPTION: "관심있는 주제와 공부한 내용을 기록합니다.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "프로젝트",
  DESCRIPTION: "작업한 프로젝트를 게시합니다.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "검색",
  DESCRIPTION: "키워드를 통해 게시글을 찾습니다.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "홈", 
    HREF: "/", 
  },
  { 
    TEXT: "블로그", 
    HREF: "/blog", 
  },
  { 
    TEXT: "프로젝트", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "sherlock203b@gmail.com",
    HREF: "mailto:sherlock203b@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "Xerlocked",
    HREF: "https://github.com/Xerlocked"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "김근홍",
    HREF: "https://www.linkedin.com/in/geunhong-kim-74333b196",
  },
]

