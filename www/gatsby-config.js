require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

const GA = {
  identifier: `UA-93349937-5`,
  viewId: `176383508`,
}

const dynamicPlugins = []
if (process.env.ANALYTICS_SERVICE_ACCOUNT) {
  // pick data from 3 months ago
  const startDate = new Date()
  // temporary lower guess to use 2 days of data to lower guess data
  // real fix is to move gatsby-plugin-guess to aot mode
  // startDate.setMonth(startDate.getMonth() - 3)
  startDate.setDate(startDate.getDate() - 2)
  dynamicPlugins.push({
    resolve: `gatsby-plugin-guess-js`,
    options: {
      GAViewID: GA.viewId,
      jwt: {
        client_email: process.env.ANALYTICS_SERVICE_ACCOUNT,
        // replace \n characters in real new lines for circleci deploys
        private_key: process.env.ANALYTICS_SERVICE_ACCOUNT_KEY.replace(
          /\\n/g,
          `\n`
        ),
      },
      period: {
        startDate,
        endDate: new Date(),
      },
    },
  })
}

if (process.env.AIRTABLE_API_KEY) {
  dynamicPlugins.push({
    resolve: `gatsby-source-airtable`,
    options: {
      apiKey: process.env.AIRTABLE_API_KEY,
      tables: [
        {
          baseId: `app0q5U0xkEwZaT9c`,
          tableName: `Community Events Submitted`,
          queryName: `CommunityEvents`,
        },
      ],
    },
  })
}

if (!process.env.DISABLE_SOURCE_DOCS) {
  dynamicPlugins.push({
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `docs`,
      path: `${__dirname}/../docs/`,
    },
  })
  // The `packages` directory is only used for API definitions,
  // which are part of the docs.
  dynamicPlugins.push({
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `gatsby-core`,
      path: `${__dirname}/../packages/gatsby/`,
      ignore: [`**/dist/**`],
    },
  })
}

module.exports = {
  siteMetadata: {
    title: `GatsbyJS`,
    siteUrl: `https://www.gatsbyjs.org`,
    description: `Blazing fast modern site generator for React`,
    twitter: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-theme-ui`,
    {
      resolve: `gatsby-alias-imports`,
      options: {
        aliases: {
          // Relative paths when importing components from MDX break translations of the docs,
          // so use an alias instead inside MDX:
          // https://www.gatsbyjs.org/contributing/docs-and-blog-components/#importing-other-components
          "@components": `${__dirname}/src/components`,
        },
      },
    },
    {
      resolve: `gatsby-source-npm-package-search`,
      options: {
        // If DISABLE_NPM_SEARCH is true, search for a placeholder keyword
        // that returns a lot fewer packages
        // (In this case, stuff that Lennart has published)
        keywords: process.env.DISABLE_NPM_SEARCH
          ? [`lekoarts`]
          : [`gatsby-plugin`, `gatsby-component`],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `guidelines`,
        path: `${__dirname}/src/data/guidelines/`,
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `${__dirname}/src/utils/typography`,
      },
    },
    `gatsby-transformer-documentationjs`,
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/diagram`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/assets`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        shouldBlockNodeFromTransformation(node) {
          return (
            [`NPMPackage`, `NPMPackageReadme`].includes(node.internal.type) ||
            (node.internal.type === `File` &&
              node.sourceInstanceName === `gatsby-core`)
          )
        },
        gatsbyRemarkPlugins: [
          `gatsby-remark-embedder`,
          `gatsby-remark-graphviz`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 786,
              backgroundColor: `#ffffff`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.5rem`,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 104,
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-embedder`,
          `gatsby-remark-graphviz`,
          `gatsby-remark-code-titles`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 786,
              backgroundColor: `#ffffff`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.5rem`,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 104,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              aliases: {
                dosini: `ini`,
                env: `bash`,
                es6: `js`,
                flowchart: `none`,
                gitignore: `none`,
                gql: `graphql`,
                htaccess: `apacheconf`,
                mdx: `markdown`,
                ml: `fsharp`,
                styl: `stylus`,
              },
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          // convert images using http to https in plugin library READMEs
          `gatsby-remark-http-to-https`,
        ],
      },
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        color: `#9D7CBF`,
        showSpinner: false,
      },
    },
    `gatsby-plugin-emotion`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-layout`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `${__dirname}/src/assets/gatsby-icon.png`,
      },
    },
    `gatsby-plugin-remove-serviceworker`,
    `gatsby-transformer-csv`,
    `gatsby-plugin-twitter`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          include: /assets\/(guidelines|icons|ornaments)\/.*\.svg$/,
        },
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: GA.identifier,
        anonymize: true,
        allowLinker: true,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            title: `GatsbyJS`,
            query: `
              {
                allMdx(
                  sort: { order: DESC, fields: [frontmatter___date] }
                  limit: 10,
                  filter: {
                    fields: { section: { eq: "blog" }, released: { eq: true } }
                  }
                ) {
                  nodes {
                    html
                    frontmatter {
                      title
                      date
                      author {
                        id
                      }
                    }
                    fields {
                      excerpt
                      slug
                    }
                  }
                }
              }
            `,
            output: `/blog/rss.xml`,
            setup: ({
              query: {
                site: { siteMetadata },
              },
            }) => {
              return {
                title: siteMetadata.title,
                description: siteMetadata.description,
                feed_url: siteMetadata.siteUrl + `/blog/rss.xml`,
                site_url: siteMetadata.siteUrl,
                generator: `GatsbyJS`,
              }
            },
            serialize: ({ query: { site, allMdx } }) =>
              allMdx.nodes.map(node => {
                return {
                  title: node.frontmatter.title,
                  description: node.fields.excerpt,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                  author: node.frontmatter.author.id,
                  date: node.frontmatter.date,
                }
              }),
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          "/*": [
            `Referrer-Policy: strict-origin-when-cross-origin`,
            `Clear-Site-Data: "cache", "storage"`,
          ],
          "/sw.js": [
            `Cache-Control: max-age=0,no-cache,no-store,must-revalidate`,
          ],
        },
      },
    },
    `gatsby-plugin-netlify-cache`,
    {
      resolve: `gatsby-plugin-mailchimp`,
      options: {
        endpoint: `https://gatsbyjs.us17.list-manage.com/subscribe/post?u=1dc33f19eb115f7ebe4afe5ee&amp;id=f366064ba7`,
      },
    },
    {
      resolve: `gatsby-transformer-screenshot`,
      options: {
        nodeTypes: [`StartersYaml`],
      },
    },
    // `gatsby-plugin-subfont`,
  ].concat(dynamicPlugins),
}
