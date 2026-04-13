import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils';
import { fonts } from '../utils/fonts';
import { moderateScale } from '../utils/metrics';

interface CustomQuestDescriptionProps {
  description?: string;
}

function extractDescriptionText(raw: string | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  // Extract everything between '"description":"' and the next '"' that is followed by a comma or closing brace
  const match = raw.match(/"description"\s*:\s*"([\s\S]*?)(?="(,|}))/);
  if (match && match[1]) {
    return match[1];
  }
  // If not found, just return the raw string
  return raw;
}

function stripHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  // Remove \r, \n, and unicode escape sequences like \u201d
  text = text.replace(/\\r|\\n|\\u[\dA-Fa-f]{4}/g, ' ');
  // Also remove any actual newlines or carriage returns
  text = text.replace(/[\r\n]/g, ' ');
  return text;
}

const CustomQuestDescription = ({description}: CustomQuestDescriptionProps) => {
  const desc = extractDescriptionText(description);

  if (!desc) {
    return (
      <View>
        <Text style={{color: 'red'}}>No description found</Text>
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.headingText}>{'Quest details:'}</Text>
      <View style={[styles.textInput]}>
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <Text style={styles.descriptionText}>{stripHtml(desc)}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default CustomQuestDescription;

const styles = StyleSheet.create({
  headingText: {
    color: colors.headerBlack,
    fontWeight: '700',
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  textInput: {
    paddingHorizontal: moderateScale(10),
    fontFamily: fonts.Light,
    color: colors.headerBlack,
    borderWidth: moderateScale(2),
    borderStyle: 'dashed',
    borderRadius: moderateScale(8),
    marginTop: moderateScale(8),
    marginHorizontal: moderateScale(5),
    borderColor: colors.primaryYellow,
    maxHeight: moderateScale(150),
    paddingVertical: moderateScale(10),
  },
  descriptionText: {
    fontWeight: '400',
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
    color: colors.headerBlack,
  },
});
