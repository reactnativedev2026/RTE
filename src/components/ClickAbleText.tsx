import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';

export function renderAnchors(htmlString: string,normalTextStyle:object) {
  const regex = /<a href="(.*?)">(.*?)<\/a>/g;
  const elements: JSX.Element[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(htmlString)) !== null) {
    // Text before <a>
    if (match.index > lastIndex) {
      elements.push(
        <Text key={`text-${lastIndex}`}>
          {htmlString.slice(lastIndex, match.index)}
        </Text>
      );
    }

    const url = match[1];
    const linkText = match[2];

    // The clickable link
    elements.push(
      <Text
        key={`link-${match.index}`}
        style={styles.link}
        onPress={() => Linking.openURL(url)}
      >
        {linkText}
      </Text>
    );

    lastIndex = regex.lastIndex;
  }

  // Remaining text after last <a>
  if (lastIndex < htmlString.length) {
    elements.push(
      <Text style={[normalTextStyle]} key={`text-${lastIndex}`}>
        {htmlString.slice(lastIndex)}
      </Text>
    );
  }

  return <Text style={[styles.text,normalTextStyle]}>{elements}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 16, color: '#000' },
  link: { color: 'blue', textDecorationLine: 'underline' },
});
