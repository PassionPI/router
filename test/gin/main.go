package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	x := r.Group("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"mid": "x",
		})
		c.Next()
	})
	y := r.Group("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"mid": "y",
		})
		c.Next()
	})

	x.Use(func(c *gin.Context) {
		println("test regist")
		c.Next()
	})
	x.Any("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	x.GET("/ping/*asd", func(c *gin.Context) {
		x := c.Param("asd")

		c.JSON(200, gin.H{
			"message": "/ping/*asd" + " " + x,
		})
	})
	y.GET("/:ping/*asd", func(c *gin.Context) {
		x := c.Param("asd")
		y := c.Param("ping")

		c.JSON(200, gin.H{
			"message": "/:ping/*asd" + " " + y + " " + x,
		})
	})
	// r.GET("/ping/pong", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "pong",
	// 	})
	// })
	// g := r.Group("/ping")
	// g.GET("/pong", func(c *gin.Context) {
	// 	c.JSON(200, gin.H{
	// 		"message": "Group ping pong",
	// 	})
	// })
	r.Run()
}
